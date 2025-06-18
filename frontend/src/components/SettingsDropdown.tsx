import { useState } from 'react'
import api from '../axios/api';
type SettingsDropdownProps = {
    setMessages: React.Dispatch<React.SetStateAction<any[]>>;
};

function SettingsDropdown({ setMessages }: SettingsDropdownProps) {

    const [showDropdown, setShowDropdown] = useState(false);
    const handleClearChat = async () => {
        try {
            // Clear chat logic here, e.g., API call to clear chat history
            await api.post('/chat/clear-chat');
            setMessages([]);
        }
        catch (error) {
            console.error("Error clearing chat:", error);
        }
    };

    const handleLogout = async () => {
        try {
            localStorage.removeItem('access_token');
            window.location.href = '/';
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
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
                            handleClearChat();
                            setShowDropdown(false);
                        }}
                    >
                        Clear Chat
                    </button>
                    <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-200 text-gray-800 rounded-b-xl"
                        onClick={() => {
                            handleLogout();
                            setShowDropdown(false);
                        }}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    )
}

export default SettingsDropdown