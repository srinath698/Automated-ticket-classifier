from pathlib import Path
from typing import List, Optional
import joblib
import numpy as np

from app.config import MODEL_PATH
from app.schemas import PredictResponse, ClassProbability
from app.services.routing import get_routing_for_category, DEPARTMENT_MAP


class TicketClassifierService:
    _instance: Optional["TicketClassifierService"] = None

    def __init__(self, model_path: Path = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self.classes_: List[str] = []
        self.load_model()

    def load_model(self) -> None:
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model file not found at {self.model_path.resolve()}. "
                "Ensure models/ticket_classifier.joblib is present."
            )
        self.model = joblib.load(self.model_path)
        if hasattr(self.model, "classes_"):
            self.classes_ = [str(c) for c in self.model.classes_]
        else:
            raise ValueError("Loaded model object does not contain 'classes_' attribute.")

    @classmethod
    def get_instance(cls) -> "TicketClassifierService":
        if cls._instance is None:
            cls._instance = TicketClassifierService()
        return cls._instance

    def predict(self, ticket_text: str) -> PredictResponse:
        cleaned_text = ticket_text.strip()
        if not cleaned_text:
            raise ValueError("Ticket text cannot be empty.")

        # Pipeline handles TF-IDF vectorization and LogisticRegression
        pred_label = self.model.predict([cleaned_text])[0]
        prob_distribution = self.model.predict_proba([cleaned_text])[0]

        probabilities: List[ClassProbability] = []
        for cat, prob in zip(self.classes_, prob_distribution):
            dept_info = DEPARTMENT_MAP.get(cat, {})
            probabilities.append(
                ClassProbability(
                    category=cat,
                    probability=round(float(prob), 4),
                    percentage=round(float(prob) * 100.0, 2),
                    badge_color=dept_info.get("color", "zinc"),
                    badge_bg=dept_info.get("badge_bg", "rgba(113, 113, 122, 0.12)"),
                    badge_text=dept_info.get("badge_text", "#3F3F46"),
                )
            )

        # Sort probabilities descending
        probabilities.sort(key=lambda p: p.probability, reverse=True)

        top_prob = float(np.max(prob_distribution))
        routing = get_routing_for_category(str(pred_label))

        return PredictResponse(
            ticket_text=ticket_text,
            predicted_category=str(pred_label),
            confidence=round(top_prob, 4),
            confidence_percentage=round(top_prob * 100.0, 2),
            probabilities=probabilities,
            recommended_routing=routing,
        )


def get_classifier() -> TicketClassifierService:
    return TicketClassifierService.get_instance()
