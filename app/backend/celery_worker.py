# celery_worker.py

from celery import Celery
from app.config import settings

celery_app = Celery(
    "email_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)

celery_app.conf.timezone = "UTC"
