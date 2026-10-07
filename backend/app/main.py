from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import CORS_ORIGINS
from app.routes.api import router as api_router
from app.services.classifier import get_classifier


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Preload classifier model on startup
    print("Initializing Ticket Classifier Model...")
    classifier = get_classifier()
    print(f"Model loaded successfully with classes: {classifier.classes_}")
    yield
    print("Shutting down TicketTriage service...")


app = FastAPI(
    title="TicketTriage - Support Ticket Auto-Classifier & Routing Service",
    description="Machine Learning service for support ticket classification, routing recommendations, and contextual explanations.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for local frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API routes first
app.include_router(api_router)

# Mount built frontend static files if available
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
else:
    @app.get("/")
    async def root():
        return {
            "service": "TicketTriage Assistant API",
            "status": "operational",
            "docs": "/docs",
            "health": "/api/health",
        }
