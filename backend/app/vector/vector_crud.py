from langchain_ollama import OllamaLLM as Ollama
from app.vector.chroma import vectorstore
from typing import List, Dict
import uuid



def summarize_chat(messages: List[Dict[str, str]]) -> str:
    """
    Summarizes a list of chat messages using Ollama.
    """
    full_chat = "\n".join(f"{m['role'].capitalize()}: {m['content']}" for m in messages)
    prompt = f"Summarize the following conversation (the users information mental state bio are more important):\n\n{full_chat}\n\nSummary:"
    llm = Ollama(model="llama3")
    return llm.invoke(prompt).strip()


def store_chat_summary(user_id: str, messages: List[Dict[str, str]]):
    """
    Summarizes and stores a user's chat history in ChromaDB.
    """
    if not messages:
        return {"message": "No chat messages to store."}

    summary = summarize_chat(messages)
    print(f"[store_chat_summary] Summary for user {user_id}: {summary}")
    vectorstore.add_texts(
        texts=[summary],
        metadatas=[{
            "user_id": user_id,
            "summary_id": str(uuid.uuid4())
        }]
    )

    return {"message": "Chat summary stored in vectorstore."}


def get_relevant_chat_summaries(user_id: int, query: str, k: int = 3) -> list[str]:
    """
    Retrieve up to `k` relevant chat summaries from ChromaDB for a given user and query.

    Args:
        user_id (int): The user's ID (used to filter results).
        query (str): The current user input or question.
        k (int): Number of top results to return (default is 3).

    Returns:
        List[str]: A list of chat summary texts relevant to the query.
    """
    try:
        # Retrieve all summaries for the user, ignoring the query
        # results = vectorstore.get(where={"user_id": user_id})
        results = vectorstore.similarity_search(query, k=k, filter={"user_id": user_id})
        print(results)
        return results.get("documents", [])
    except Exception as e:
        print(f"[get_relevant_chat_summaries] Error retrieving user summaries: {e}")
        return []

def clear_user_summaries(user_id: str):
    """
    Clear all chat summaries for a given user from ChromaDB.
    
    Args:
        user_id (str): The user's ID whose summaries should be cleared.
    """
    try:
        # Delete all summaries for the user
        vectorstore.delete(where={"user_id": user_id})
        print(f"[clear_user_summaries] Cleared summaries for user {user_id}.")
    except Exception as e:
        print(f"[clear_user_summaries] Error clearing user summaries: {e}")
        f"{summary_block}\n\n{base_prompt[0][1]}"
        return []
    return {"message": "User summaries cleared."}
