from app.backend.db.session import SessionLocal
from app.backend.models.email import Message
from app.backend.models.email import AIMessageAnalysis
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG) # Ensure debug messages are visible

# Add a handler if not configured globally (e.g., in your main.py/app.py)
# This ensures logs go to the console
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

def fetch_top_30_messages():
    db = SessionLocal()
    try:
        messages = db.query(Message).order_by(Message.sent_at.desc()).limit(30).all()
        logger.debug(f"Fetched top {len(messages)} messages.")
        return messages
    finally:
        db.close()

def save_ai_analysis(message_id, needs_reply, reply_draft, todos):
    from app.backend.models.email import AIMessageAnalysis # import here to avoid circular issues
    db = SessionLocal()
    try:
        analysis = db.query(AIMessageAnalysis).filter_by(message_id=message_id).first()
        if not analysis:
            analysis = AIMessageAnalysis(message_id=message_id)
            db.add(analysis)
            logger.info(f"Created new AI analysis for message ID: {message_id}")
        else:
            logger.info(f"Updating AI analysis for message ID: {message_id}")

        analysis.needs_reply = needs_reply
        analysis.reply_draft = reply_draft

        # --- NEW LOG HERE ---
        logger.debug(f"SAVE_AI_ANALYSIS: Attempting to save 'todos' for message ID {message_id}. Value: '{todos}' (Type: {type(todos)})")
        analysis.todo = todos
        analysis.processed_at = datetime.utcnow()
        db.commit()
        logger.debug(f"Successfully saved AI analysis for {message_id}. todo column value after commit: '{analysis.todo}'")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save AI analysis for {message_id}: {e}", exc_info=True)
    finally:
        db.close()

def get_todos_from_db():
    db = SessionLocal()
    try:
        total_analysis_records = db.query(AIMessageAnalysis).count()
        logger.debug(f"GET_TODOS_FROM_DB: Total AIMessageAnalysis records in DB: {total_analysis_records}")

        results = (
            db.query(AIMessageAnalysis)
            .filter(AIMessageAnalysis.todo.isnot(None), AIMessageAnalysis.todo != "")
            .all()
        )
        # logger.debug(f"GET_TODOS_FROM_DB: Found {(results)} AIMessageAnalysis records with non-empty 'todo' after filtering.")

        todos_list = []
        for row in results:
            # --- NEW LOG HERE ---
            # logger.debug(f"GET_TODOS_FROM_DB: Processing row for message ID {row.message_id}. Raw 'todo' value from DB: '{row.todo}' (Type: {type(row.todo)})")

            if row.todo: # This check is technically redundant due to the filter, but harmless
                try:
                    parsed_todo = json.loads(row.todo)
                    logger.debug(f"Successfully parsed todo JSON for message ID: {parsed_todo}")
                except json.JSONDecodeError:
                    parsed_todo = {"title": row.todo}  # fallback if not proper JSON
                    # logger.warning(f"Failed to parse todo JSON for message ID {row.message_id}. Falling back to title: '{row.todo}'")

                todos_list.append({
                    "id": row.id,
                    "message_id": row.message_id,
                    **parsed_todo
                })
        logger.debug(f"GET_TODOS_FROM_DB: Prepared {len(todos_list)} todos for response.")
        return todos_list
    except Exception as e:
        logger.error(f"GET_TODOS_FROM_DB: An error occurred while fetching todos: {e}", exc_info=True)
        raise
    finally:
        db.close()

def get_reply_drafts_from_db():
    db = SessionLocal()
    logger.debug("GET_REPLY_DRAFTS_FROM_DB: Attempting to fetch reply drafts from DB.")
    try:
        results = (
            db.query(AIMessageAnalysis, Message)
            .join(Message, AIMessageAnalysis.message_id == Message.message_id)
            .filter(AIMessageAnalysis.reply_draft.isnot(None), AIMessageAnalysis.reply_draft != "")
            .all()
        )

        logger.debug(f"GET_REPLY_DRAFTS_FROM_DB: Found {len(results)} combined results for reply drafts.")

        reply_drafts_list = []
        for ai_analysis, message in results:
            if ai_analysis.reply_draft:
                reply_drafts_list.append({
                    "id": ai_analysis.id,
                    "message_id": ai_analysis.message_id,
                    "reply_draft": ai_analysis.reply_draft,
                    "needs_reply": ai_analysis.needs_reply,
                    "processed_at": ai_analysis.processed_at,
                    "sender": message.sender,
                    "subject": message.subject,
                    "body": message.body
                })
        logger.debug(f"GET_REPLY_DRAFTS_FROM_DB: Prepared {len(reply_drafts_list)} reply drafts for response.")
        return reply_drafts_list
    except Exception as e:
        logger.error(f"GET_REPLY_DRAFTS_FROM_DB: An error occurred while fetching reply drafts: {e}", exc_info=True)
        raise
    finally:
        db.close()