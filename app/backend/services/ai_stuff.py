# app/services/ai_stuff.py

import os
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq
from app.config import settings
from datetime import datetime
import json # Import json for serialization
import logging # Import logging
from sqlalchemy.orm import Session
from app.backend.models import email  # your DB session dependency
from fastapi import Depends
from app.backend.models.email import Message
from app.backend.db.session import SessionLocal

ai_logger = logging.getLogger(__name__)
ai_logger.setLevel(logging.DEBUG) # Set to DEBUG to see all messages

if not ai_logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    ai_logger.addHandler(handler)

# Load environment variables
env_path = Path('app') / '.env'
load_dotenv(dotenv_path=env_path)

# Initialize Groq client with API key from .env
api_key = settings.GROQ_API_KEY # Assuming settings.GROQ_API_KEY is correctly loaded
client = Groq(api_key=api_key)

def flag_reply_needed(message):
    prompt = f"""
You are an assistant that determines if an email requires a reply.

Email from {message['sender']}:

Subject: {message['subject']}
Body: {message['body']}

Does this email need a reply? Answer only "Yes" or "No".
"""
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.0 # Keep this low for consistent "Yes/No"
        )
        answer = completion.choices[0].message.content.strip().lower()
        ai_logger.debug(f"Flag reply needed AI response: '{answer}'")
        return answer == "yes"
    except Exception as e:
        ai_logger.error(f"Error flagging reply needed: {e}", exc_info=True)
        return False # Default to False on error

def generate_reply(message):
    prompt = f"""
You are an assistant helping to draft a polite, concise reply email.

Email from {message['sender']}:

Subject: {message['subject']}
Body: {message['body']}

Write a polite, professional reply to the email below.
If any important detail (e.g., availability, preferences, confirmation) is
unknown or ambiguous, insert a placeholder (e.g., {{insert your availability}},
OR provide alternative phrasings that the user can choose from). Keep the reply clear, helpful, and adaptable.
"""
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7 # Allow some creativity for replies
        )
        reply_content = completion.choices[0].message.content.strip()
        ai_logger.debug(f"Generated reply draft: '{reply_content[:100]}...'")
        return reply_content
    except Exception as e:
        ai_logger.error(f"Error generating reply: {e}", exc_info=True)
        return "Error generating reply. Please try again." # Default reply on error

def extract_todos_from_message(message):
    # This prompt now explicitly asks for JSON output
    prompt = f"""
You are an assistant that extracts actionable tasks from emails.
For each task, provide a "title" (string) and "completed" (boolean, default to false).
If there are no tasks, return an empty JSON array: [].
Ensure your entire response is a valid JSON array.

Email from {message['sender']}:
Subject: {message['subject']}
Body: {message['body']}

JSON tasks:
"""
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You extract tasks from emails and return them as a JSON array."},
                {"role": "user", "content": prompt},
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.0 
        )

        raw_ai_output = completion.choices[0].message.content.strip()
        ai_logger.debug(f"Raw AI output for todos: '{raw_ai_output}'")

        # Attempt to parse the AI's raw string response
        try:
            parsed_data = json.loads(raw_ai_output)
            # Ensure the parsed data is a list
            if not isinstance(parsed_data, list):
                ai_logger.warning(f"AI returned non-list JSON for todos. Converting to empty list. Raw: '{raw_ai_output}'")
                parsed_data = []

            # Ensure each item in the list is a dict and has 'title' and 'completed'
            # This adds robustness if the AI doesn't perfectly follow the schema
            cleaned_todos = []
            for item in parsed_data:
                if isinstance(item, dict) and "title" in item:
                    cleaned_todos.append({
                        "title": item["title"],
                        "completed": item.get("completed", False) # Default to False if not provided by AI
                    })
                else:
                    ai_logger.warning(f"Skipping malformed todo item from AI: {item}")

            final_json_string = json.dumps(cleaned_todos)
            ai_logger.debug(f"extract_todos_from_message returning final JSON string: '{final_json_string}'")
            return final_json_string

        except json.JSONDecodeError:
            ai_logger.error(f"AI returned unparseable JSON for todos: '{raw_ai_output}'. Returning empty array string.", exc_info=True)
            return "[]" # If AI output is not valid JSON, return an empty array string

    except Exception as e:
        ai_logger.error(f"Error during AI model call for todos: {e}. Returning empty array string.", exc_info=True)
        return "[]" 

def generate_reply_from_conversation(messages: list[dict]) -> str:
    system_prompt = (
        "You are an expert assistant helping the user draft professional, polite, "
        "and concise email replies based on their chat messages. "
        "Always keep the tone courteous and clear. "
        "If any important information is missing, provide placeholders or ask clarifying questions. "
        "Adapt to the context of the conversation and maintain coherence."
    )
    try:
        completion = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}] + messages,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        ai_logger.error(f"Error generating reply: {e}", exc_info=True)
        return "Error generating reply. Please try again."
    

def fetchRecentEmails(count: int = 5) -> list[dict]:
    """
    Fetch the most recent 'count' emails for the given user from the 'messages' table.
    """
    db = SessionLocal()
    emails = (
        db.query(Message.sender, Message.subject, Message.body)
        #   .order_by(Message.date.desc())
          .limit(count)
          .all()
    )
    print("The emails are", emails)
    result = [
        {
            "sender": email.sender,
            "subject": email.subject,
            "body": email.body,
        }
        for email in emails
    ]

    return result
    

def buildQAPrompt(emails: list[dict], question: str) -> str:
    email_texts = "\n\n".join(
        f"Subject: {email['subject']}\nFrom: {email['sender']}\nBody: {email['body']}"
        for email in emails
    )
    prompt = f"""
You are an assistant that answers questions based on recent emails.

Here are the recent emails:

{email_texts}

Question: {question}

Answer the question based on the emails above. If you don’t know the answer, say “I don’t have that information.”
"""
    return prompt.strip()


def answerQuestionWithLLM(prompt: str) -> str:
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.0,  # deterministic answers
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        ai_logger.error(f"Error answering question: {e}", exc_info=True)
        return "Sorry, I couldn't answer that."



