import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services import llm
from app.services.routing import DEPARTMENT_MAP

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert len(data["classes"]) == 5
    assert "openrouter_configured" in data
    assert set(data["classes"]) == {
        "account_problem",
        "billing_issue",
        "bug",
        "feature_request",
        "general_inquiry",
    }


def test_predict_billing():
    res = client.post(
        "/api/predict",
        json={"text": "I was charged twice on my credit card for invoice #4402"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_category"] == "billing_issue"
    assert data["recommended_routing"]["department"] == "Billing Support"
    assert len(data["probabilities"]) == 5


def test_predict_account():
    res = client.post(
        "/api/predict",
        json={"text": "Merge accounts and change email address for user"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_category"] == "account_problem"
    assert data["recommended_routing"]["department"] == "Account Support"


def test_predict_bug():
    res = client.post(
        "/api/predict",
        json={"text": "The application crashes with a blank screen when clicking save"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_category"] == "bug"
    assert data["recommended_routing"]["department"] == "Technical Support"


def test_predict_feature_request():
    res = client.post(
        "/api/predict",
        json={"text": "Please consider adding dark mode support and custom themes"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_category"] == "feature_request"
    assert data["recommended_routing"]["department"] == "Product Team"


def test_predict_general_inquiry():
    res = client.post(
        "/api/predict",
        json={"text": "What is the price for basic plan subscription?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_category"] == "general_inquiry"
    assert data["recommended_routing"]["department"] == "Customer Support"


def test_predict_routing_integrity():
    # Test that whichever category is returned, the recommended department matches the centralized mapping
    samples = [
        "Payment issue",
        "Error in code",
        "Please add export feature",
        "Pricing questions",
        "Merge account",
    ]
    for text in samples:
        res = client.post("/api/predict", json={"text": text})
        assert res.status_code == 200
        data = res.json()
        cat = data["predicted_category"]
        expected_dept = DEPARTMENT_MAP[cat]["department"]
        assert data["recommended_routing"]["department"] == expected_dept


def test_predict_validation():
    # Empty string should fail validation
    res = client.post("/api/predict", json={"text": "  "})
    assert res.status_code == 422

    # Missing text field
    res = client.post("/api/predict", json={})
    assert res.status_code == 422


def test_metrics_endpoint():
    res = client.get("/api/metrics")
    assert res.status_code == 200
    data = res.json()
    assert round(data["accuracy"], 2) == 0.95
    assert data["test_size"] == 166
    assert data["train_size"] == 660
    assert data["total_deduplicated_size"] == 826
    assert data["raw_size"] == 2000
    assert len(data["per_class_metrics"]) == 5
    assert len(data["confusion_matrix"]) == 5


def test_explain_without_openrouter_key(monkeypatch):
    # Verify that even without an OpenRouter key, ML prediction succeeds and returns a graceful fallback.
    monkeypatch.setattr(llm, "OPENROUTER_API_KEY", "")
    res = client.post(
        "/api/explain",
        json={"text": "I was charged twice on my credit card for invoice #4402"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["prediction"]["predicted_category"] == "billing_issue"
    assert data["llm_status"] == "skipped_no_key"


def test_chat_without_openrouter_key(monkeypatch):
    monkeypatch.setattr(llm, "OPENROUTER_API_KEY", "")
    res = client.post(
        "/api/chat",
        json={
            "ticket_text": "I was charged twice",
            "predicted_category": "billing_issue",
            "recommended_department": "Billing Support",
            "confidence_percentage": 94.5,
            "conversation_history": [],
            "message": "Can you explain why this went to Billing Support?",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 0
    assert data["llm_status"] == "skipped_no_key"
