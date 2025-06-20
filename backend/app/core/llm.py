from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_community.chat_models import ChatOllama
from typing import AsyncGenerator
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.runnables import Runnable
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
import re
import app.crud as crud
from sqlalchemy.orm import Session
import app.schemas as schemas
import traceback
import asyncio

def get_langchain_chain(db: Session, user_id: int) -> RunnableWithMessageHistory:
    
    def load_history(session_id: str) -> BaseChatMessageHistory:
        """Load chat history from database and return as BaseChatMessageHistory"""
        history = crud.get_chat_history(db, user_id=user_id)
        
        messages: List[BaseMessage] = []
        if history:
            for msg in history:
                try:
                    parsed = schemas.ChatMessage.model_validate(msg)
                    content = parsed.content
                    role = parsed.role
                except Exception as e:
                    print(f"Error parsing message: {msg}, error: {e}")
                    continue

                if role == "user":
                    messages.append(HumanMessage(content=content))
                elif role in ["bot", "assistant"]:
                    messages.append(AIMessage(content=content))

        # Create InMemoryChatMessageHistory and populate it with messages
        chat_history = InMemoryChatMessageHistory()
        for message in messages:
            chat_history.add_message(message)
        
        return chat_history

    # Setup the LangChain chain
    llm = ChatOllama(model="llama3:latest", streaming=True)
    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are a friendly, helpful, and knowledgeable human assistant. "
            "You should never reveal that you are an AI, a language model, or how you were built. "
            "Respond naturally and conversationally, as if you're a real person. "
            "Avoid any overly robotic or technical language unless specifically asked. "
            # "If someone asks about your origin, reply vaguely or steer the conversation elsewhere."
        )),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}")
    ])
    base_chain = prompt | llm

    return RunnableWithMessageHistory(
        base_chain,
        load_history,
        input_messages_key="input",
        history_messages_key="history"
    )

async def stream_bot_response(
    content: str,
    chain: Runnable,
    session_id: str,
    cancel_event: asyncio.Event = None
) -> AsyncGenerator[str, None]:
    """
    Streams the chatbot response with detailed debugging.
    """
    try:
        print(f"Starting stream for session: {session_id}")
        print(f"Input content: {content}")
        print(f"Chain type: {type(chain)}")
        
        # Test the chain configuration
        config = {"configurable": {"session_id": session_id}}
        input_data = {"input": content}
        
        print(f"Config: {config}")
        print(f"Input data: {input_data}")
        
        # Try streaming
        chunk_count = 0
        async for chunk in chain.astream(input_data, config=config):
            if cancel_event and cancel_event.is_set():
                print("Stream cancelled")
                yield "[Stream cancelled]"
                return
            chunk_count += 1
            # Handle different chunk types
            if isinstance(chunk, str):
                token = chunk
            elif hasattr(chunk, 'content'):
                token = str(chunk.content) if chunk.content else ""
            elif isinstance(chunk, dict):
                # Handle dict responses
                token = chunk.get('content', '') or chunk.get('output', '') or str(chunk)
            else:
                token = str(chunk)
            
            if token:
                yield token
            

    except Exception as e:
        error_msg = f"Stream error: {str(e)}"
        print(f"Full traceback: {traceback.format_exc()}")
        yield f"[Error: {error_msg}]"