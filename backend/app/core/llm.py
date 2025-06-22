from langchain_ollama import OllamaLLM as Ollama
from langchain.callbacks.base import AsyncCallbackHandler
from typing import AsyncGenerator, List, Any, Dict, Optional
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.runnables import Runnable
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
from langchain_core.outputs import LLMResult
import re
import app.crud as crud
from sqlalchemy.orm import Session
import app.schemas as schemas
import traceback
import asyncio
from langchain_core.runnables import RunnableLambda
import app.vector.vector_crud as vector_crud
from collections import defaultdict


class AsyncStreamingCallbackHandler(AsyncCallbackHandler):
    """Async callback handler for streaming tokens"""
    
    def __init__(self):
        self.tokens = []
        self.current_token_event = asyncio.Event()
        self.stream_done_event = asyncio.Event()
        self.current_token = None
        self.error = None
    
    async def on_llm_start(self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any) -> None:
        """Called when LLM starts running"""
        self.tokens = []
        self.stream_done_event.clear()
        print("LLM started")
    
    async def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        """Called when a new token is generated"""
        self.current_token = token
        self.tokens.append(token)
        self.current_token_event.set()
        # Reset for next token
        self.current_token_event = asyncio.Event()
    
    async def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        """Called when LLM finishes"""
        print("LLM finished")
        self.current_token = None
        self.stream_done_event.set()
    
    async def on_llm_error(self, error: Exception, **kwargs: Any) -> None:
        """Called when LLM encounters an error"""
        print(f"LLM error: {error}")
        self.error = error
        self.current_token = f"[Error: {str(error)}]"
        self.current_token_event.set()
        self.stream_done_event.set()
        

 # Temporary in-memory session store
_demo_sessions: Dict[str, InMemoryChatMessageHistory] = defaultdict(InMemoryChatMessageHistory)

def get_demo_langchain_chain() -> RunnableWithMessageHistory:
    """Creates a simple LangChain chain for demonstration purposes."""

    def load_history(session_id: str) -> InMemoryChatMessageHistory:
        return _demo_sessions[session_id]

    llm = Ollama(model="llama3", temperature=0.7)
    
    base_prompt = [
        ("system", "You are a friendly, helpful, and knowledgeable human assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}")
    ]

    prompt = ChatPromptTemplate.from_messages(base_prompt)

    async def chain_with_summary_injection(inputs: dict, config: dict = None):
        user_input = inputs.get("input", "")
        prompt_with_input = prompt.format(input=user_input, history=inputs.get("history", []))
        return await llm.ainvoke(prompt_with_input, config=config)

    return RunnableWithMessageHistory(
        RunnableLambda(chain_with_summary_injection),
        load_history,
        input_messages_key="input",
        history_messages_key="history"
    )

def get_langchain_chain(db: Session, user_id: int) -> RunnableWithMessageHistory:
    def load_history(session_id: str) -> InMemoryChatMessageHistory:
        history = crud.get_chat_history(db, user_id=user_id)
        messages: List[BaseMessage] = []

        if history:
            for msg in history:
                try:
                    parsed = schemas.ChatMessage.model_validate(msg)
                    content = parsed.content
                    role = parsed.role
                    if role == "user":
                        messages.append(HumanMessage(content=content))
                    elif role in ["bot", "assistant"]:
                        messages.append(AIMessage(content=content))
                except Exception as e:
                    print(f"Failed to parse message: {msg}, error: {e}")

        chat_history = InMemoryChatMessageHistory()
        for message in messages:
            chat_history.add_message(message)

        return chat_history

    llm = Ollama(model="llama3", temperature=0.7)
    user = crud.get_by_sub_or_email(db, sub=user_id)
    if user:
        name_text = f"You are talking to {user.name}."
    else:
        name_text = "You are talking to a user."
    base_prompt = [
        ("system", (
            "You are a friendly, helpful, and knowledgeable human assistant. "
            f"{name_text} "
            " You should never reveal that you are an AI, a language model, or how you were built. "
            "Respond naturally and conversationally."
        )),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}")
    ]

    async def chain_with_summary_injection(inputs: dict, config: dict = None):
        user_input = inputs.get("input", "")
        summaries = vector_crud.get_relevant_chat_summaries(user_id=user_id, query=user_input)

        if summaries:
            # Inject summaries before system prompt
            summary_block = "\n\n".join(f"- {s}" for s in summaries)
            system_prompt = (
                f"You are a warm, empathetic, and emotionally intelligent human assistant who supports people with their thoughts and feelings. "
                "Always respond with kindness, care, and without judgment. Validate the user's emotions, encourage self-compassion, and avoid giving medical or clinical advice. "
                "You are not an AI or a therapist—speak like a compassionate human friend who listens deeply.\n\n"
                "Here are some summaries of the user's past conversations that might help you understand their emotional journey:\n"
                f"{summary_block}\n\n"
                "Use this emotional background to guide your understanding and respond gently to their current input."
            )
        else:
            system_prompt = base_prompt[0][1]  # Default fallback

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}")
        ])

        chain = prompt | llm
        return await chain.ainvoke(inputs, config=config)

    return RunnableWithMessageHistory(
        RunnableLambda(chain_with_summary_injection),
        load_history,
        input_messages_key="input",
        history_messages_key="history"
    )

async def stream_bot_response_async(
    content: str,
    chain: Runnable,
    session_id: str,
    cancel_event: asyncio.Event = None
) -> AsyncGenerator[str, None]:
    """
    Fully async streaming approach using AsyncCallbackHandler
    """
    try:
        print(f"Starting async stream for session: {session_id}")
        print(f"Input content: {content}")
        
        # Create async streaming callback handler
        streaming_callback = AsyncStreamingCallbackHandler()
        
        # Configuration with callback
        config = {
            "configurable": {"session_id": session_id},
            "callbacks": [streaming_callback]
        }
        input_data = {"input": content}
        
        # Start the chain execution as a background task
        chain_task = asyncio.create_task(
            chain.ainvoke(input_data, config=config)
        )
        
        token_count = 0
        
        # Stream tokens as they become available
        while not streaming_callback.stream_done_event.is_set():
            if cancel_event and cancel_event.is_set():
                chain_task.cancel()
                yield "[Stream cancelled]"
                return
            
            try:
                # Wait for next token or timeout
                await asyncio.wait_for(
                    streaming_callback.current_token_event.wait(), 
                    timeout=0.1
                )
                
                if streaming_callback.current_token:
                    token_count += 1
                    token = streaming_callback.current_token
                    yield token
                    
            except asyncio.TimeoutError:
                # Check if chain is done
                if chain_task.done():
                    break
                continue
            except Exception as e:
                print(f"Token streaming error: {e}")
                break
        
        # Wait for chain to complete
        try:
            await chain_task
        except Exception as e:
            print(f"Chain completion error: {e}")
            if streaming_callback.error:
                yield f"[Error: {streaming_callback.error}]"
        
        print(f"Stream completed. Total tokens: {token_count}")
        
    except Exception as e:
        error_msg = f"Stream error: {str(e)}"
        print(f"Full traceback: {traceback.format_exc()}")
        yield f"[Error: {error_msg}]"

