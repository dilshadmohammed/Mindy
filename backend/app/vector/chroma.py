# app/vector/chroma.py

from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from pathlib import Path

# Path to persist Chroma DB
CHROMA_DIR = Path("chroma_store")
CHROMA_DIR.mkdir(exist_ok=True)

COLLECTION_NAME = "user_chat_summaries"

# Use HuggingFace embedding (offline, free)
embedding = OllamaEmbeddings(model="nomic-embed-text")  # or mistral, phi3, etc.


# Vectorstore instance
vectorstore = Chroma(
    collection_name=COLLECTION_NAME,
    embedding_function=embedding,
    persist_directory=str(CHROMA_DIR)
)

