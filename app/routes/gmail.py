# app/routes/gmail.py

from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from app.config import settings
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

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

    results = service.users().messages().list(userId="me", maxResults=5).execute()
    messages = results.get("messages", [])

    message_data = []
    for msg in messages:
        msg_detail = service.users().messages().get(userId="me", id=msg["id"]).execute()
        snippet = msg_detail.get("snippet", "")
        message_data.append({"id": msg["id"], "snippet": snippet})


    from app.services.gmail import store_email_data
    for msg in messages:
        msg_detail = service.users().messages().get(userId="me", id=msg["id"]).execute()
        store_email_data(msg["threadId"], msg_detail)


    return {"messages": message_data}
