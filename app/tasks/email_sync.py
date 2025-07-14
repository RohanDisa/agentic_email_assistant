# app/tasks/email_sync.py

from celery_worker import celery_app
from app.routes.gmail import user_tokens  # Replace with real DB token storage later
from app.models.email import Thread, Message
from app.db.session import SessionLocal
from datetime import datetime
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from sqlalchemy.exc import IntegrityError

@celery_app.task
def sync_emails():
    creds_data = user_tokens.get("default_user")
    if not creds_data:
        print("No tokens available.")
        return

    creds = Credentials(
        token=creds_data["access_token"],
        refresh_token=creds_data["refresh_token"],
        token_uri=creds_data["token_uri"],
        client_id=creds_data["client_id"],
        client_secret=creds_data["client_secret"],
        scopes=creds_data["scopes"],
    )

    service = build("gmail", "v1", credentials=creds)
    db = SessionLocal()

    try:
        result = service.users().messages().list(userId="me", maxResults=20).execute()
        messages = result.get("messages", [])

        for msg in messages:
            msg_detail = service.users().messages().get(userId="me", id=msg["id"]).execute()
            thread_id = msg["threadId"]

            headers = {h["name"]: h["value"] for h in msg_detail["payload"]["headers"]}
            subject = headers.get("Subject")
            sender = headers.get("From")
            recipient = headers.get("To")
            sent_at = int(msg_detail.get("internalDate", "0")) / 1000

            thread = db.query(Thread).filter_by(thread_id=thread_id).first()
            if not thread:
                thread = Thread(
                    thread_id=thread_id,
                    subject=subject,
                    snippet=msg_detail.get("snippet", ""),
                    history_id=msg_detail.get("historyId")
                )
                db.add(thread)
                db.commit()

            message = Message(
                message_id=msg["id"],
                thread_id=thread_id,
                sender=sender,
                recipient=recipient,
                subject=subject,
                body=msg_detail.get("snippet", ""),
                sent_at=datetime.utcfromtimestamp(sent_at)
            )
            db.add(message)
            db.commit()

    except Exception as e:
        print("Sync error:", e)
        db.rollback()
    finally:
        db.close()
