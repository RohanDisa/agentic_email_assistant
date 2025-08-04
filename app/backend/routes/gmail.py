# app/routes/gmail.py

from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from app.config import settings
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from ..services.ai_stuff import flag_reply_needed, generate_reply, extract_todos_from_message
from ..scripts.preprocess_msgs import fetch_top_30_messages, save_ai_analysis
from ..scripts.preprocess_msgs import get_todos_from_db
from ..scripts.preprocess_msgs import get_reply_drafts_from_db




router = APIRouter()

@router.get("/authorize")
def authorize():
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token"
            }
        },
        scopes=["https://www.googleapis.com/auth/gmail.readonly"],
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI

    authorization_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    return RedirectResponse(authorization_url)


user_tokens = {}

@router.get("/callback")
async def oauth2_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        return {"error": "No code found in request"}


# here if u see we have restablished the Oauth connection
# why? because the "code" that we get after the user authorizes is just one time use
# thats why we restablish the connection and do flow.fetch_token to get a more permanent kinda solution

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token"
            }
        },
        scopes=["https://www.googleapis.com/auth/gmail.readonly"],
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI

    flow.fetch_token(code=code)

    credentials = flow.credentials

    # ⚠️ Save this securely in production (encrypted DB)
    user_tokens["default_user"] = {
        "access_token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes,
    }

    return {"message": "Authorization successful", "scopes": credentials.scopes}

@router.get("/messages")
async def list_messages():
    try:
        creds_data = user_tokens.get("default_user")
        if not creds_data:
            return {"error": "User not authenticated"}

        creds = Credentials(
            token=creds_data["access_token"],
            refresh_token=creds_data["refresh_token"],
            token_uri=creds_data["token_uri"],
            client_id=creds_data["client_id"],
            client_secret=creds_data["client_secret"],
            scopes=creds_data["scopes"],
        )

        service = build("gmail", "v1", credentials=creds)

        results = service.users().messages().list(userId="me", maxResults=30).execute()
        messages = results.get("messages", [])

        message_data = []

        from app.backend.services.gmail import store_email_data

        for msg in messages:
            msg_detail = service.users().messages().get(userId="me", id=msg["id"]).execute()
            snippet = msg_detail.get("snippet", "")
            message_data.append({
                "id": msg["id"],
                "threadId": msg["threadId"],
                "snippet": snippet,
            })

            try:
                store_email_data(msg["threadId"], msg_detail)
            except Exception as e:
                print(f"Error storing message {msg['id']}: {e}")

        return {"messages": message_data}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
    
@router.get("/ai_analysis")
async def ai_analysis():
    messages = fetch_top_30_messages()
    processed = []

    for msg in messages:
        message_data = {
            "sender": msg.sender,
            "subject": msg.subject,
            "body": msg.body,
        }

        needs_reply = flag_reply_needed(message_data)
        reply_draft = generate_reply(message_data) if needs_reply else None
        todos = extract_todos_from_message(message_data)

        print("The generated draft is", reply_draft)
        print("Extracted To-Dos:", todos)

        save_ai_analysis(
            message_id=msg.message_id,
            needs_reply=needs_reply,
            reply_draft=reply_draft,
            todos=todos  # Make sure your save_ai_analysis accepts this
        )

        processed.append({
            "message_id": msg.message_id,
            "needs_reply": needs_reply,
            "reply_draft": reply_draft,
            "todos": todos
        })

    return {"processed_messages": processed}

@router.get("/todos")
async def get_todos():
    """Get all todos extracted from emails"""
    try:
        todos = get_todos_from_db()  
        return {"todos": todos}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@router.get("/reply_drafts")
async def get_todos():
    """Get all todos extracted from emails"""
    try:
        reply_drafts = get_reply_drafts_from_db() 
        return {"reply_drafts": reply_drafts}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

