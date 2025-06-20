import { useEffect, useState } from "react";
import VoiceChat from "./components/VoiceChat";
import UserMessage from "./components/UserMessage";
import BotMessage from "./components/BotMessage";
import BotTyping from "./components/BotTyping";
import QuickResponse from "./components/QuickResponse";
import api from "./axios/api";
import SettingsDropdown from "./components/SettingsDropdown";
import { useRef } from "react";

type Message = {
    role: "user" | "bot";
    content: string;
};

function Chat() {
    const [voiceActive, setVoiceActive] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Load initial messages if needed, e.g., from local storage or API
        const fetchInitialMessages = async () => {
            const initialMessages = await api.get("/chat/history");
            if (initialMessages.data) {
                console.log("Initial messages loaded:", initialMessages.data.chat_history);
                setMessages(initialMessages.data.chat_history);
            }
        };
        fetchInitialMessages();
    }, []);

    // Store WebSocket instance in a ref to persist across renders
    const socketRef = useRef<WebSocket | null>(null);

    // Helper to connect/reconnect websocket
    const connectWebSocket = () => {
        const accessToken = localStorage.getItem("access_token");
        const socket = new WebSocket(`ws://localhost:8000/chat/ws/chat?access_token=${encodeURIComponent(accessToken || "")}`);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connection established");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.role === "bot") {
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
                return [...prev, { role: "bot", content: data.content }];
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

        setMessages((prev) => [...prev, { role: "user", content: message }]);
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
		<div className="flex flex-col min-h-screen">
            <div className="flex justify-end p-4 sticky top-0 z-10 bg-white/80 backdrop-blur">
               <SettingsDropdown setMessages={setMessages} />
            </div>
            <div className="flex-1 flex flex-col justify-start min-h-0 overflow-auto">
                <div className="flex flex-col w-full max-w-4xl mx-auto">
                    {(() => {
                        
                        return (
                            <>
                                {messages.length === 0 && <QuickResponse handleMessageSend={handleMessageSend} />}
                                {messages.map((msg, idx) =>
                                    msg.role === "user" ? (
                                        <UserMessage key={idx} message={msg.content} />
                                    ) : (
                                        <BotMessage key={idx} message={msg.content} />
                                    )
                                )}
                                {isLoading && <BotTyping />}
                            </>
                        );
                    })()}
                </div>
            </div>
			<div className="bg-white border-t border-green-100 p-4">
				<div className="flex flex-col items-center max-w-3xl mx-auto">
					<div className="flex items-center w-full space-x-3">
						<button
							className={`w-12 h-12 ${voiceActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group`}
							onClick={() => setVoiceActive((v) => !v)}
						>
							<span className="material-symbols-outlined text-white group-hover:scale-110 transition-transform duration-300">
								{voiceActive ? "close" : "mic"}
							</span>
						</button>
						{!voiceActive && (
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Share your thoughts..."
                                    className="w-full bg-green-50 border border-green-200 rounded-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-300"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleMessageSend(inputMessage);
                                            setInputMessage("");
                                        }
                                    }}
                                />
                                <button
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-600 transition-colors duration-300"
                                    onClick={() => {
                                        handleMessageSend(inputMessage);
                                        setInputMessage("");
                                    }}
                                >
                                    <span className="material-symbols-outlined">send</span>
                                </button>
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

export default Chat