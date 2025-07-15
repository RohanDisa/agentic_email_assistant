from app.db.session import SessionLocal
from app.models.email import Message
from datetime import datetime
from services.ai_stuff import flag_reply_needed, generate_reply

def fetch_top_30_messages():
    db = SessionLocal()
    try:
        messages = db.query(Message).order_by(Message.sent_at.desc()).limit(30).all()
        return messages
    finally:
        db.close()

def save_ai_analysis(message_id, needs_reply, reply_draft):
    from app.models.email import AIMessageAnalysis  # import here to avoid circular issues
    db = SessionLocal()
    try:
        analysis = db.query(AIMessageAnalysis).filter_by(message_id=message_id).first()
        if not analysis:
            analysis = AIMessageAnalysis(message_id=message_id)
            db.add(analysis)
        analysis.needs_reply = needs_reply
        analysis.reply_draft = reply_draft
        analysis.processed_at = datetime.utcnow()
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Failed to save AI analysis for {message_id}: {e}")
    finally:
        db.close()

# def process_messages():
#     messages = fetch_top_30_messages()
#     for msg in messages:
#         message_data = {
#             "sender": msg.sender,
#             "subject": msg.subject,
#             "body": msg.body,
#         }
#         needs_reply = flag_reply_needed(message_data)
#         reply_draft = generate_reply(message_data) if needs_reply else None

#         save_ai_analysis(msg.message_id, needs_reply, reply_draft)
#         print(f"Processed message {msg.message_id}: needs_reply={needs_reply}")

# # Example call
# process_messages()
