from app.db.session import SessionLocal

def init():
    db = SessionLocal()
    db.close()