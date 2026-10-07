from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_path: str
    classes: List[str]
    openrouter_configured: bool
    openrouter_model: str


class PredictRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=3,
        max_length=5000,
        description="Ticket subject and/or body text to classify",
    )


class ClassProbability(BaseModel):
    category: str
    probability: float
    percentage: float
    badge_color: str
    badge_bg: str
    badge_text: str


class DepartmentRouting(BaseModel):
    department: str
    description: str
    color: str
    badge_bg: str
    badge_text: str


class PredictResponse(BaseModel):
    ticket_text: str
    predicted_category: str
    confidence: float
    confidence_percentage: float
    probabilities: List[ClassProbability]
    recommended_routing: DepartmentRouting


class ExplainRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=5000)


class ExplainResponse(BaseModel):
    prediction: PredictResponse
    ticket_summary: str
    explanation: str
    suggested_next_steps: List[str]
    llm_status: str  # "success", "skipped_no_key", "error", "timeout"
    llm_error: Optional[str] = None


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'/'model'")
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    ticket_text: str = Field(..., min_length=1, max_length=5000)
    predicted_category: str
    recommended_department: str
    confidence_percentage: float
    conversation_history: List[ChatMessage] = Field(default_factory=list)
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    reply: str
    llm_status: str  # "success", "skipped_no_key", "error"
    error: Optional[str] = None


class PerClassMetric(BaseModel):
    category: str
    precision: float
    recall: float
    f1_score: float
    support: int


class MetricsResponse(BaseModel):
    accuracy: float
    log_loss: float
    roc_auc_macro: float
    macro_f1: float
    weighted_f1: float
    train_size: int
    test_size: int
    total_deduplicated_size: int
    raw_size: int
    classes: List[str]
    per_class_metrics: List[PerClassMetric]
    confusion_matrix: List[List[int]]
    methodology: Dict[str, Any]
