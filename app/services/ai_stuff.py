import os
from pathlib import Path  # You missed this import
from dotenv import load_dotenv
from groq import Groq
from app.config import settings
from datetime import datetime

env_path = Path('app') / '.env'
load_dotenv(dotenv_path=env_path)

# api_key = os.getenv('GROQ_API_KEY')
api_key = settings.GROQ_API_KEY

# Initialize Groq client with API key from .env
client = Groq(api_key=api_key)

def flag_reply_needed(message):
    prompt = f"""
You are an assistant that determines if an email requires a reply.

Email from {message['sender']}:

Subject: {message['subject']}
Body: {message['body']}

Does this email need a reply? Answer only "Yes" or "No".
"""
    completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
    )
    answer = completion.choices[0].message.content.strip().lower()
    return answer == "yes"

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
    completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
    )
    return completion.choices[0].message.content.strip()

def extract_todos_from_message(message):
    prompt = f"""
You are an assistant that extracts actionable tasks from emails.

Email from {message['sender']}:
Subject: {message['subject']}
Body: {message['body']}

List any tasks or to-dos mentioned in this email in bullet form.
If there are none, reply with "No tasks found."
"""
    completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You extract tasks from emails."},
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
    )

    output = completion.choices[0].message.content.strip()

    if "no tasks found" in output.lower():
        return []

    # Parse bullets into clean task list
    todos = [
        line.lstrip("-*• ").strip()
        for line in output.splitlines()
        if line.strip() and (line.strip().startswith(("-", "*", "•")))
    ]

    return todos
