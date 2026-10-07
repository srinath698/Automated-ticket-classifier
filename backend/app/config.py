from pathlib import Path
import os
from dotenv import load_dotenv

# Try loading from backend/.env first, then root .env
backend_dir = Path(__file__).resolve().parent.parent
root_dir = backend_dir.parent

env_paths = [
    backend_dir / ".env",
    root_dir / ".env",
]

for p in env_paths:
    if p.exists():
        load_dotenv(p)
        break


# OpenRouter API configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free").strip()
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"


HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))

# Parse CORS origins
cors_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
CORS_ORIGINS = [orig.strip() for orig in cors_env.split(",") if orig.strip()]

# Model artifact path
MODEL_PATH = root_dir / "models" / "ticket_classifier.joblib"
DATASET_PATH = root_dir / "dataset" / "support_tickets.csv"
