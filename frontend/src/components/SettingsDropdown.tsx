import { useState, useRef, useEffect } from 'react'
import api from '../axios/api';
type SettingsDropdownProps = {
    setMessages: React.Dispatch<React.SetStateAction<any[]>>;
};

function SettingsDropdown({ setMessages }: SettingsDropdownProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        }
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleClearChat = async () => {
        try {
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

    const handleClearMemory = async () => {
        try {
            await api.post('/chat/clear-memories');
        }
        catch (error) {
            console.error("Error clearing memories:", error);
        }
    };

    return (
        <div ref={dropdownRef} className="relative bg-green-200 p-2 rounded-2xl shadow-lg">
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
                        className="w-full text-left px-4 py-2 hover:bg-gray-200 text-gray-800"
                        onClick={() => {
                            handleClearMemory();
                            setShowDropdown(false);
                        }}
                    >
                        Clear Memory
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