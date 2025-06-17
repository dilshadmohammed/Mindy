from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from app.core.config import settings
from app import crud, models
from sqlalchemy.orm import Session
from app.api import deps
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from urllib.parse import urlencode

router = APIRouter()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

SCOPES = ["openid", "email", "profile"]

@router.get("/google/login")
def google_login():
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "prompt": "consent"
    }
    url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    return RedirectResponse(url)

@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(deps.get_db)):
    # Exchange code for token
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }

    async with httpx.AsyncClient() as client:
        token_res = await client.post(GOOGLE_TOKEN_URL, data=data)
        token_res.raise_for_status()
        token_data = token_res.json()
        id_token_str = token_data.get("id_token")

    try:
        id_info = id_token.verify_oauth2_token(id_token_str, google_requests.Request(), settings.GOOGLE_CLIENT_ID)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid Google token")


    # id_info now contains user data
    email = id_info["email"]
    name = id_info.get("name", "")
    sub = id_info.get("sub","")
    picture = id_info.get("picture","")

    # Get or create user
    user = crud.user.get_by_email(db, email=email)
    if not user:
        user = crud.user.create_user(db, email=email, name=name, sub=sub, picture=picture)

    # For demo, return user info
    return user