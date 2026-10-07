
import json
from typing import List, Dict, Any
import httpx

from app.config import (
    OPENROUTER_API_KEY,
    OPENROUTER_MODEL,
    OPENROUTER_API_URL,
)
from app.schemas import PredictResponse, ChatMessage


class LLMService:
    @staticmethod
    def is_configured() -> bool:
        return bool(
            OPENROUTER_API_KEY
            and OPENROUTER_API_KEY.strip()
            and OPENROUTER_API_KEY != "your_openrouter_api_key_here"
        )

    @staticmethod
    def _headers() -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "X-Title": "Automated Ticket Classifier",
        }

    @staticmethod
    def _extract_content(data: Dict[str, Any]) -> str:
        content = data["choices"][0]["message"]["content"]

        # Most models return a string; handle list-form content too.
        if isinstance(content, list):
            content = "\n".join(
                item.get("text", "")
                for item in content
                if isinstance(item, dict)
            )

        if not isinstance(content, str) or not content.strip():
            raise ValueError("The AI provider returned an empty response.")

        return content.strip()

    @staticmethod
    def _parse_json(text: str) -> Dict[str, Any]:
        text = text.strip()

        if text.startswith("```"):
            lines = text.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines).strip()

        result = json.loads(text)

        if not isinstance(result, dict):
            raise ValueError("The AI response was not a JSON object.")

        return result

    @staticmethod
    def _strip_reasoning(text: str) -> str:
        if not text:
            return text
        stripped = text.strip()
        lower = stripped.lower()
        if lower.startswith("here's a thinking process") or lower.startswith("thinking process"):
            lines = stripped.splitlines()
            markers = ("final answer", "response:", "draft:")
            for idx, line in enumerate(lines):
                line_clean = line.strip().lower().lstrip("#*-_ ").rstrip("*_ ")
                for marker in markers:
                    if line_clean.startswith(marker):
                        pos = line.lower().find(marker)
                        after_marker = line[pos + len(marker):].lstrip(":* \t")
                        remaining_lines = lines[idx + 1:]
                        if after_marker and remaining_lines:
                            return f"{after_marker}\n" + "\n".join(remaining_lines).strip()
                        elif after_marker:
                            return after_marker.strip()
                        elif remaining_lines:
                            return "\n".join(remaining_lines).strip()
        return stripped

    @classmethod
    async def generate_explanation(
        cls, prediction: PredictResponse
    ) -> Dict[str, Any]:
        department = prediction.recommended_routing.department

        fallback = {
            "ticket_summary": (
                "AI summary unavailable. The ML classification is still available."
            ),
            "explanation": (
                f"The ML model classified this ticket as "
                f"'{prediction.predicted_category}' with "
                f"{prediction.confidence_percentage}% confidence. "
                "The AI explanation service could not complete the request."
            ),
            "suggested_next_steps": [
                f"Route the ticket to {department}.",
                "Verify the relevant customer and account details.",
                "Review the issue described in the ticket.",
            ],
            "llm_status": "error",
            "llm_error": None,
        }

        if not cls.is_configured():
            fallback["llm_status"] = "skipped_no_key"
            fallback["llm_error"] = (
                "OPENROUTER_API_KEY is not configured in backend/.env."
            )
            return fallback

        system_prompt = (
            "You are an AI support-ticket explanation assistant. "
            "The supplied machine-learning classification is authoritative. "
            "Never change the category, confidence, or assigned team. "
            "Do not invent facts about the customer or claim actions were completed. "
            "Return only a valid JSON object with keys: ticket_summary, "
            "explanation, suggested_next_steps. The first two values must "
            "be strings, and suggested_next_steps must be a list of three "
            "practical actions. "
            "Reply with ONLY the final answer for the agent. Do not show your analysis, "
            "thinking process, or restate these rules."
        )

        user_prompt = f"""
Ticket text:
{prediction.ticket_text}

Authoritative ML result:
- Category: {prediction.predicted_category}
- Confidence: {prediction.confidence_percentage}%
- Recommended team: {department}

Summarize the ticket, explain briefly why its wording may relate to the
predicted category, and suggest three practical next steps.
Do not recalculate or modify the ML result.
"""

        payload = {
            "model": OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 600,
            "reasoning": {"exclude": True},
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(
                    OPENROUTER_API_URL,
                    headers=cls._headers(),
                    json=payload,
                )

                if response.status_code in (429, 404, 503) and payload.get("model") != "openrouter/auto":
                    fallback_payload = dict(payload)
                    fallback_payload["model"] = "openrouter/auto"
                    response = await client.post(
                        OPENROUTER_API_URL,
                        headers=cls._headers(),
                        json=fallback_payload,
                    )

            if response.status_code != 200:
                fallback["llm_error"] = (
                    f"OpenRouter returned HTTP {response.status_code}: "
                    f"{response.text[:300]}"
                )
                return fallback

            parsed = cls._parse_json(
                cls._extract_content(response.json())
            )

            summary = parsed.get("ticket_summary", "")
            explanation = parsed.get("explanation", "")
            steps = parsed.get("suggested_next_steps", [])

            if not isinstance(summary, str) or not isinstance(explanation, str):
                raise ValueError("The AI returned invalid summary fields.")

            if not isinstance(steps, list):
                steps = []

            steps = [str(step) for step in steps[:3]]

            return {
                "ticket_summary": summary,
                "explanation": explanation,
                "suggested_next_steps": steps or fallback["suggested_next_steps"],
                "llm_status": "success",
                "llm_error": None,
            }

        except httpx.TimeoutException:
            fallback["llm_status"] = "timeout"
            fallback["llm_error"] = "OpenRouter request timed out."
            return fallback
        except (ValueError, KeyError, IndexError, TypeError) as error:
            fallback["llm_error"] = (
                f"Could not parse the OpenRouter response: {error}"
            )
            return fallback
        except httpx.HTTPError as error:
            fallback["llm_error"] = (
                f"Network error while contacting OpenRouter: {error}"
            )
            return fallback
        except Exception as error:
            fallback["llm_error"] = f"Unexpected AI service error: {error}"
            return fallback

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
                "reply": (
                    "The AI assistant is unavailable because "
                    "OPENROUTER_API_KEY is not configured. "
                    "Quick Classification remains available."
                ),
                "llm_status": "skipped_no_key",
                "error": "OPENROUTER_API_KEY is not configured.",
            }

        system_prompt = f"""
You are a helpful support-ticket assistant.

Current ticket:
{ticket_text}

Authoritative ML classification: {predicted_category}
ML confidence: {confidence_percentage}%
Recommended team: {recommended_department}

Rules:
1. Answer questions about this ticket clearly and professionally.
2. Never change the ML category, confidence, or recommended team.
3. Do not claim a refund, account change, or other action has occurred.
4. Do not invent information that is not provided.
5. Keep answers concise and useful.
Reply with ONLY the final answer for the agent. Do not show your analysis, thinking process, or restate these rules.
"""

        messages = [{"role": "system", "content": system_prompt}]

        for message in conversation_history[-8:]:
            role = (
                "assistant"
                if message.role in ["assistant", "model"]
                else "user"
            )
            messages.append({
                "role": role,
                "content": message.content,
            })

        messages.append({"role": "user", "content": latest_message})

        payload = {
            "model": OPENROUTER_MODEL,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 800,
            "reasoning": {"exclude": True},
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(
                    OPENROUTER_API_URL,
                    headers=cls._headers(),
                    json=payload,
                )

                if response.status_code in (429, 404, 503) and payload.get("model") != "openrouter/auto":
                    fallback_payload = dict(payload)
                    fallback_payload["model"] = "openrouter/auto"
                    response = await client.post(
                        OPENROUTER_API_URL,
                        headers=cls._headers(),
                        json=fallback_payload,
                    )

            if response.status_code != 200:
                return {
                    "reply": (
                        "The AI provider returned an error. "
                        "Please try again shortly."
                    ),
                    "llm_status": "error",
                    "error": (
                        f"OpenRouter HTTP {response.status_code}: "
                        f"{response.text[:300]}"
                    ),
                }

            reply = cls._extract_content(response.json())
            reply = cls._strip_reasoning(reply)

            return {
                "reply": reply,
                "llm_status": "success",
                "error": None,
            }

        except httpx.TimeoutException:
            return {
                "reply": "The AI request timed out. Please try again.",
                "llm_status": "timeout",
                "error": "OpenRouter request timed out.",
            }
        except httpx.HTTPError as error:
            return {
                "reply": "Unable to connect to the AI service. Please try again.",
                "llm_status": "error",
                "error": str(error),
            }
        except Exception as error:
            return {
                "reply": "The AI service could not process the response.",
                "llm_status": "error",
                "error": str(error),
            }
