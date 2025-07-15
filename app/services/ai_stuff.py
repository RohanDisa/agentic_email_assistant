import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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

Write a reply to this email:
"""
    completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
    )
    return completion.choices[0].message.content.strip()

# Example usage:
message = {
    "sender": "alice@example.com",
    "subject": "Project update",
    "body": "Hey, can you send me the latest update on the project?"
}

if flag_reply_needed(message):
    reply = generate_reply(message)
    print("AI Reply:", reply)
else:
    print("No reply needed.")
