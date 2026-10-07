from fastapi import APIRouter, HTTPException, status
from app.config import MODEL_PATH, OPENROUTER_MODEL
from app.schemas import (
    HealthResponse,
    PredictRequest,
    PredictResponse,
    ExplainRequest,
    ExplainResponse,
    ChatRequest,
    ChatResponse,
    MetricsResponse,
)
from app.services.classifier import get_classifier
from app.services.llm import LLMService
from app.services.metrics import MetricsService

router = APIRouter(prefix="/api", tags=["API"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    classifier = get_classifier()
    return HealthResponse(
        status="healthy",
        model_loaded=classifier.model is not None,
        model_path=str(MODEL_PATH),
        classes=classifier.classes_,
openrouter_configured=LLMService.is_configured(),
openrouter_model=OPENROUTER_MODEL,
           )


@router.post("/predict", response_model=PredictResponse)
async def predict_ticket(request: PredictRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Ticket text cannot be empty or whitespace.",
        )
    try:
        classifier = get_classifier()
        return classifier.predict(text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification error: {str(e)}",
        )


@router.post("/explain", response_model=ExplainResponse)
async def explain_ticket(request: ExplainRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Ticket text cannot be empty or whitespace.",
        )
    classifier = get_classifier()
    prediction = classifier.predict(text)

    llm_result = await LLMService.generate_explanation(prediction)

    return ExplainResponse(
        prediction=prediction,
        ticket_summary=llm_result["ticket_summary"],
        explanation=llm_result["explanation"],
        suggested_next_steps=llm_result["suggested_next_steps"],
        llm_status=llm_result["llm_status"],
        llm_error=llm_result.get("llm_error"),
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_ticket(request: ChatRequest):
    message = request.message.strip()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message cannot be empty.",
        )

    res = await LLMService.chat(
        ticket_text=request.ticket_text,
        predicted_category=request.predicted_category,
        recommended_department=request.recommended_department,
        confidence_percentage=request.confidence_percentage,
        conversation_history=request.conversation_history,
        latest_message=message,
    )

    return ChatResponse(
        reply=res["reply"],
        llm_status=res["llm_status"],
        error=res.get("error"),
    )


@router.get("/metrics", response_model=MetricsResponse)
async def get_model_metrics():
    try:
        return MetricsService.get_metrics()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate metrics: {str(e)}",
        )
