from sqlalchemy.orm import Session
from app import models, schemas

def get_users(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, email: str, name: str, sub: str, picture: str):
    new_user = models.User(email=email, name=name, sub=sub, picture=picture)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_by_sub_or_email(db: Session, sub: str):
    return db.query(models.User).filter(
        (models.User.sub == sub) | (models.User.email == sub)
    ).first()