from fastapi import FastAPI
from app.routes import gmail

app = FastAPI(title="AI-Powered Email Assistant")

# Register your routes
app.include_router(gmail.router, prefix="/gmail", tags=["Gmail"])
