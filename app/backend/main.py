from fastapi import FastAPI
from app.backend.routes import gmail

app = FastAPI(title="AI-Powered Email Assistant")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Or ["*"] for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register your routes
app.include_router(gmail.router, prefix="/gmail", tags=["Gmail"])
