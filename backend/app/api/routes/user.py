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
from app.core.security import create_access_token, decode_access_token
from app import schemas
from fastapi import Header


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
    return {"auth_url": url}

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
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Google token")

    email = id_info["email"]
    name = id_info.get("name", "")
    sub = id_info.get("sub", "")
    picture = id_info.get("picture", "")

    user = crud.user.get_by_email(db, email=email)
    if not user:
        user = crud.user.create_user(db, email=email, name=name, sub=sub, picture=picture)

    access_token = create_access_token({"sub": user.sub or user.email})

    # Redirect to frontend with token in URL fragment for localStorage
    redirect_url = f"http://localhost:5173/oauth-callback#access_token={access_token}"
    return RedirectResponse(url=redirect_url)


@router.get("/profile", response_model=schemas.User)
def get_profile(current_user: models.User = Depends(deps.get_current_user)):
    return current_user

@router.get("/verify-access-token")
def verify_access_token(
    db: Session = Depends(deps.get_db),
    authorization: str = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing Authorization header")
    token = authorization.split(" ")[1]
    try:
        payload = decode_access_token(token)
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=400, detail="Invalid token payload")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid access token")

    user = crud.user.get_by_sub_or_email(db, sub=sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"email": user.email, "name": user.name, "sub": user.sub, "picture": user.picture}
