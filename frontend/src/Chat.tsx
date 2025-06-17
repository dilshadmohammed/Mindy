import { useState } from "react";
import VoiceChat from "./components/VoiceChat";
import UserMessage from "./components/UserMessage";
import BotMessage from "./components/BotMessage";
import BotTyping from "./components/BotTyping";
import QuickResponse from "./components/QuickResponse";
import api from "./axios/api";
import { Bot } from "lucide-react";

function Chat() {
    const [voiceActive, setVoiceActive] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    type Message = {
        type: "user" | "bot";
        message: string;
    };

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleMessageSend = async (message: string) => {
        if (!message.trim()) return;

        // Add user message to the chat
        setMessages((prev) => [...prev, { type: "user", message }]);
        setIsLoading(true);

        try {
            // Send message to the backend
            const response = await api.post("/chat", { content: message });
            const botResponse = response.data?.bot_message.content || "Sorry, I didn't understand that.";

            // Add bot response to the chat
            setMessages((prev) => [...prev, { type: "bot", message: botResponse }]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [...prev, { type: "bot", message: "An error occurred while processing your message." }]);
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
		<div className="flex flex-col min-h-screen">
            <div className="flex justify-end p-4 sticky top-0 z-10 bg-white/80 backdrop-blur">
                <div className="relative">
                    <button
                        className={`w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110`}
                        onClick={() => setShowDropdown((prev) => !prev)}
                    >
                        <span
                            className={`material-symbols-outlined text-green-700 transition-transform duration-300 ${showDropdown ? "rotate-90" : ""}`}
                        >
                            settings
                        </span>
                    </button>
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-40 bg-gray-100 border border-gray-300 rounded-xl shadow-lg z-20">
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-200 text-gray-800 rounded-t-xl"
                                onClick={() => {
                                    // Clear chat logic here
                                    setShowDropdown(false);
                                }}
                            >
                                Clear Chat
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-200 text-gray-800 rounded-b-xl"
                                onClick={() => {
                                    // Logout logic here
                                    setShowDropdown(false);
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-start min-h-0 overflow-auto">
                <div className="flex flex-col w-full max-w-4xl mx-auto">
                    {(() => {
                        
                        return (
                            <>
                                {messages.length === 0 && <QuickResponse />}
                                {messages.map((msg, idx) =>
                                    msg.type === "user" ? (
                                        <UserMessage key={idx} message={msg.message} />
                                    ) : (
                                        <BotMessage key={idx} message={msg.message} />
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