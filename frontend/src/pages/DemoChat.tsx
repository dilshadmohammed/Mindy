import { useEffect, useState } from "react";
import VoiceChat from "../components/VoiceChat";
import UserMessage from "../components/UserMessage";
import BotMessage from "../components/BotMessage";
import BotTyping from "../components/BotTyping";
import QuickResponse from "../components/QuickResponse";
import { useRef } from "react";

type Message = {
    role: "user" | "bot";
    content: string;
    datetime: string; // ISO string
};

function DemoChat() {
    const [voiceActive, setVoiceActive] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

    // Store WebSocket instance in a ref to persist across renders
    const socketRef = useRef<WebSocket | null>(null);

    // Helper to connect/reconnect websocket
    const connectWebSocket = () => {
        const socket = new WebSocket(`ws://localhost:8000/chat/ws/demo-chat`);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connection established");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "stream_start") {
                setIsStreaming(true);
            } else if (data.type === "stream_end") {
                setIsStreaming(false);
            }
            else if (data.type === "stream_token" && data.role === "bot") {
            setMessages((prev) => {
                // If last message is from bot, append content; else, add new bot message
                if (prev.length > 0 && prev[prev.length - 1].role === "bot") {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: updated[updated.length - 1].content + data.content,
                };
                return updated;
                } else {
                return [...prev, { role: "bot", content: data.content , datetime: new Date().toISOString() }];
                }
            });
            setIsLoading(false);
            }
        };

  

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed, attempting to reconnect...");
            // Try to reconnect after a delay
            setTimeout(() => {
                connectWebSocket();
            }, 2000);
        };
    };

    // useEffect to handle chat websocket connection
    useEffect(() => {
        connectWebSocket();
        return () => {
            socketRef.current?.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Function to handle sending messages to bot via websocket
    const handleMessageSend = (message: string) => {
        if (!message.trim()) return; // Prevent sending empty messages

        setMessages((prev) => [...prev, { role: "user", content: message, datetime: new Date().toISOString() }]);
        setInputMessage("");
        setIsLoading(true);

        // Use the existing WebSocket connection
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ role: "user", content: message }));
        } else {
            setIsLoading(false);
            console.error("WebSocket is not connected.");
        }
    };
    
    return (
		<div className="flex flex-col min-h-screen pt-16  bg-green-50">
            <div className="flex-1 flex flex-col justify-start min-h-0 overflow-auto">
                <div className="flex flex-col w-full max-w-4xl mx-auto">
                    {(() => {
                        
                        return (
                            <>
                                {messages.length === 0 && <div className="mt-28"><QuickResponse handleMessageSend={handleMessageSend} /></div>}
                                {messages.map((msg, idx) =>
                                    msg.role === "user" ? (
                                        <UserMessage key={idx} message={msg.content} date={msg.datetime} />
                                    ) : (
                                        <BotMessage key={idx} message={msg.content} date={msg.datetime}/>
                                    )
                                )}
                                {isLoading && <BotTyping />}
                            </>
                        );
                    })()}
                </div>
            </div>
			<div className="bg-white border-t border-green-100 p-4 mt-6">
				<div className="flex flex-col items-center max-w-3xl mx-auto">
					<div className="flex items-center w-full space-x-3">
						<button
							className={` w-12 h-12 ${voiceActive ? "bg-gray-500 hover:bg-gray-600" : "bg-green-500 hover:bg-green-600"} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group`}
							onClick={() => setVoiceActive((v) => !v)}
						>
							<span className="material-symbols-outlined text-white group-hover:scale-110 transition-transform duration-300">
								{voiceActive ? "stop" : "mic"}
							</span>
						</button>
						{!voiceActive && (
                            <div className="flex items-center space-x-3 w-full">
                                <div className="flex-1 bg-gray-100 rounded-full px-4 py-3 relative">
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        className="w-full bg-transparent border-none focus:outline-none"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleMessageSend(inputMessage);
                                                setInputMessage("");
                                            }
                                        }}
                                    />
                                </div>
                                {isStreaming ? (
                                    <button
                                        className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors duration-200"
                                        onClick={() => {
                                            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                                                socketRef.current.send(JSON.stringify({ type: "stop", content: "", role: "user" }));
                                            }
                                        }}
                                    >
                                        <span className="material-symbols-outlined text-white">stop</span>
                                    </button>
                                ) : (
                                    <button
                                        className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-200"
                                        onClick={() => {
                                            handleMessageSend(inputMessage);
                                            setInputMessage("");
                                        }}
                                    >
                                        <span className="material-symbols-outlined text-white">send</span>
                                    </button>
                                )}
                            </div>
						)}
						{voiceActive && (
							<VoiceChat />
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default DemoChat