from fastapi import FastAPI
from app.api.routes import user
from app.db.base import Base
from app.db.session import engine
app = FastAPI(title="My FastAPI App")
Base.metadata.create_all(bind=engine)
app.include_router(user.router, prefix="/users", tags=["Users"])
