from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from typing import Optional
from app.core.security import decode_access_token
from app import crud, models
from app.api import deps

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(deps.get_db)
) -> models.User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_identifier = payload.get("sub")
    if not user_identifier:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = crud.user.get_by_sub_or_email(db, sub=user_identifier)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def get_current_user_from_token(
    token: str,
    db: Session = Depends(deps.get_db)
) -> models.User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_identifier = payload.get("sub")
    if not user_identifier:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = crud.user.get_by_sub_or_email(db, sub=user_identifier)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user

