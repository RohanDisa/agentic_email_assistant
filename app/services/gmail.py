from app.db.session import SessionLocal
from app.models.email import Thread, Message
from sqlalchemy.exc import IntegrityError
from datetime import datetime

def store_email_data(thread_id, msg_detail):
    db = SessionLocal()
    try:
        headers = {h["name"]: h["value"] for h in msg_detail["payload"]["headers"]}
        subject = headers.get("Subject")
        sender = headers.get("From")
        recipient = headers.get("To")
        sent_at = int(msg_detail.get("internalDate", "0")) / 1000

        # Insert thread if not exists
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

        # Insert message
        message = Message(
            message_id=msg_detail["id"],
            thread_id=thread_id,
            sender=sender,
            recipient=recipient,
            subject=subject,
            body=msg_detail.get("snippet", ""),  # TODO: parse full body later
            sent_at=datetime.utcfromtimestamp(sent_at)
        )
        db.add(message)
        db.commit()
    except IntegrityError as e:
        db.rollback()  # Skip duplicates
        print(f"[IntegrityError] Failed to insert message {msg_detail['id']}: {e}")
    finally:
        db.close()
