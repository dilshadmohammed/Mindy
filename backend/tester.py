from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("WebSocket connection attempt")
    await websocket.accept()
    print("WebSocket connection established")
    
    try:
        # Send welcome message
        await websocket.send_text("Welcome! WebSocket connection established.")
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            print(f"Received: {data}")
            
            # Echo the message back
            response = f"Server received: {data}"
            await websocket.send_text(response)
            
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")

# Optional: WebSocket with JSON messages
@app.websocket("/ws/json")
async def websocket_json_endpoint(websocket: WebSocket):
    print("JSON WebSocket connection attempt")
    await websocket.accept()
    print("JSON WebSocket connection established")
    
    try:
        # Send welcome message
        welcome_msg = {"type": "welcome", "message": "JSON WebSocket connected!"}
        await websocket.send_text(json.dumps(welcome_msg))
        
        while True:
            # Receive JSON message
            data = await websocket.receive_text()
            print(f"Received JSON: {data}")
            
            try:
                # Parse JSON
                message = json.loads(data)
                
                # Create response
                response = {
                    "type": "echo",
                    "original": message,
                    "timestamp": asyncio.get_event_loop().time()
                }
                
                await websocket.send_text(json.dumps(response))
                
            except json.JSONDecodeError:
                error_msg = {"type": "error", "message": "Invalid JSON format"}
                await websocket.send_text(json.dumps(error_msg))
                
    except WebSocketDisconnect:
        print("JSON WebSocket client disconnected")
    except Exception as e:
        print(f"JSON WebSocket error: {e}")

# Simple HTTP endpoint for testing
@app.get("/")
async def root():
    return {"message": "WebSocket server is running. Connect to /ws or /ws/json"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)