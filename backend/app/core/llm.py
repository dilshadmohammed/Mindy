from google.generativeai import GenerativeModel
import google.generativeai as genai
from typing import List, Optional
import os
from app.core.config import settings

# Initialize the Gemini API client with the API key from settings
genai.configure(api_key=settings.GEMINI_API_KEY)

# Initialize the model (you can change model name if needed)
model = GenerativeModel("gemma-3-27b-it")

# System prompt to guide chatbot personality
SYSTEM_PROMPT = (
    "You are a compassionate, non-judgmental mental health assistant. "
    "You listen carefully, encourage self-awareness, and respond empathetically. "
    "You do not give medical advice or diagnose conditions, but can suggest general coping strategies, mindfulness techniques, and supportive conversation."
    "You should reply in Markdown format, using bullet points for lists and appropriate formatting for clarity."
)

def chat_with_mental_health_bot(user_input: str, history: Optional[List[dict]] = None) -> str:
    """
    Send a prompt to the Gemini mental health chatbot.

    Args:
        user_input (str): The user's message.
        history (Optional[List[dict]]): Optional conversation history in format:
            [{"role": "user", "parts": ["Hi"]}, {"role": "model", "parts": ["Hello, how can I support you today?"]}]

    Returns:
        str: Model response.
    """
    # Format chat history
    chat = model.start_chat(history=history or [])

    try:
        response = chat.send_message(user_input)
        return response.text
    except Exception as e:
        return f"Error communicating with Gemini: {str(e)}"
