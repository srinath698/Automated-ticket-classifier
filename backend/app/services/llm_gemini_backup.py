import json
from typing import List, Dict, Any, Optional
import httpx

from app.config import GEMINI_API_KEY, GEMINI_MODEL
from app.schemas import PredictResponse, ChatMessage

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


class LLMService:
    @staticmethod
    def is_configured() -> bool:
        return bool(
            GEMINI_API_KEY
            and GEMINI_API_KEY.strip()
            and GEMINI_API_KEY != "your_gemini_api_key_here"
        )

    @classmethod
    async def generate_explanation(cls, prediction: PredictResponse) -> Dict[str, Any]:
        if not cls.is_configured():
            return {
                "ticket_summary": "Summary unavailable (GEMINI_API_KEY is not configured in backend/.env).",
                "explanation": (
                    f"The machine learning model categorized this ticket as '{prediction.predicted_category}' "
                    f"with {prediction.confidence_percentage}% confidence. To enable AI-generated explanations, "
                    "add your Google Gemini API key to backend/.env."
                ),
                "suggested_next_steps": [
                    f"Route ticket to {prediction.recommended_routing.department}.",
                    "Verify the customer's account and contact details.",
                    "Review the specific issue described in the ticket."
                ],
                "llm_status": "skipped_no_key",
                "llm_error": "GEMINI_API_KEY is not configured.",
            }

        endpoint = f"{GEMINI_API_BASE}/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

        system_instruction = (
            "You are an AI Support Ticket Explanation Assistant. "
            "An authoritative machine learning pipeline (TF-IDF + Logistic Regression) has classified an incoming customer support ticket. "
            "CRITICAL CONSTRAINT: You MUST NOT change, override, re-categorize, or invent a new category or probability. "
            "The machine learning prediction is authoritative. Your role is only to summarize the ticket, explain the linguistic reasons "
            "for the model's decision, and suggest 3 practical next steps for the support agent."
        )

        user_prompt = f"""TICKET TEXT:
\"\"\"{prediction.ticket_text}\"\"\"

AUTHORITATIVE CLASSIFICATION:
- Category: {prediction.predicted_category}
- Model Confidence: {prediction.confidence_percentage}%
- Recommended Team: {prediction.recommended_routing.department}

Respond with a JSON object containing:
1. "ticket_summary": A concise 1-2 sentence factual summary of the customer's request.
2. "explanation": A clear 2-3 sentence explanation of why the words in the ticket point to the predicted category.
3. "suggested_next_steps": A list of 3 practical next steps for the support team."""

        payload = {
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 600,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(endpoint, json=payload)
                if res.status_code != 200:
                    return {
                        "ticket_summary": "Unable to generate summary due to API error.",
                        "explanation": (
                            f"The ML prediction is valid ({prediction.predicted_category}, "
                            f"{prediction.confidence_percentage}% confidence). Google Gemini API returned status {res.status_code}."
                        ),
                        "suggested_next_steps": [f"Route ticket to {prediction.recommended_routing.department}."],
                        "llm_status": "error",
                        "llm_error": f"Gemini API returned HTTP {res.status_code}: {res.text[:200]}",
                    }

                data = res.json()
                candidate = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                if candidate.startswith("```json"):
                    candidate = candidate[7:]
                if candidate.startswith("```"):
                    candidate = candidate[3:]
                if candidate.endswith("```"):
                    candidate = candidate[:-3]
                candidate = candidate.strip()

                parsed = json.loads(candidate)
                return {
                    "ticket_summary": parsed.get("ticket_summary", ""),
                    "explanation": parsed.get("explanation", ""),
                    "suggested_next_steps": parsed.get("suggested_next_steps", []),
                    "llm_status": "success",
                    "llm_error": None,
                }
        except httpx.TimeoutException:
            return {
                "ticket_summary": "Summary timed out.",
                "explanation": (
                    f"Machine learning prediction confirmed: '{prediction.predicted_category}' "
                    f"({prediction.confidence_percentage}%). Gemini request timed out."
                ),
                "suggested_next_steps": [f"Route ticket to {prediction.recommended_routing.department}."],
                "llm_status": "timeout",
                "llm_error": "Request to Gemini API timed out after 25 seconds.",
            }
        except Exception as e:
            return {
                "ticket_summary": "Explanation parsing failure.",
                "explanation": f"Machine learning prediction: '{prediction.predicted_category}'. Gemini response could not be parsed.",
                "suggested_next_steps": [f"Route ticket to {prediction.recommended_routing.department}."],
                "llm_status": "error",
                "llm_error": str(e),
            }

    @classmethod
    async def chat(
        cls,
        ticket_text: str,
        predicted_category: str,
        recommended_department: str,
        confidence_percentage: float,
        conversation_history: List[ChatMessage],
        latest_message: str,
    ) -> Dict[str, Any]:
        if not cls.is_configured():
            return {
                "reply": "The AI assistant is currently offline because GEMINI_API_KEY is not configured in backend/.env. Quick Classification continues to work with 100% functionality.",
                "llm_status": "skipped_no_key",
                "error": "GEMINI_API_KEY not configured.",
            }

        endpoint = f"{GEMINI_API_BASE}/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

        system_instruction = (
            f"You are TicketTriage, a helpful customer support assistant analyzing the following ticket:\n"
            f"- Customer Ticket: \"{ticket_text}\"\n"
            f"- Category (Machine Learning): {predicted_category}\n"
            f"- Model Confidence: {confidence_percentage}%\n"
            f"- Recommended Team: {recommended_department}\n\n"
            "RULES:\n"
            "1. Ground all answers firmly in this ticket's content and the machine learning classification.\n"
            "2. Never claim you have executed real refunds, account changes, or sent actual emails.\n"
            "3. Never override the predicted category or change the confidence score.\n"
            "4. Keep your answers concise, natural, professional, and helpful."
        )

        contents = []
        for msg in conversation_history[-8:]:
            # Map role: 'assistant' to Gemini's 'model'
            gemini_role = "model" if msg.role in ["assistant", "model"] else "user"
            contents.append({
                "role": gemini_role,
                "parts": [{"text": msg.content}]
            })
        contents.append({
            "role": "user",
            "parts": [{"text": latest_message}]
        })

        payload = {
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 450,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(endpoint, json=payload)
                if res.status_code != 200:
                    return {
                        "reply": f"Sorry, Google Gemini returned an error (HTTP {res.status_code}). Please try again.",
                        "llm_status": "error",
                        "error": f"Gemini HTTP {res.status_code}",
                    }
                data = res.json()
                reply = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                return {
                    "reply": reply,
                    "llm_status": "success",
                    "error": None,
                }
        except Exception as e:
            return {
                "reply": "Sorry, I encountered a connection timeout while communicating with the assistant service.",
                "llm_status": "error",
                "error": str(e),
            }
