from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import user,chat
from app.db.base import Base
from app.db.session import engine

app = FastAPI(title="My FastAPI App")

# CORS policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])