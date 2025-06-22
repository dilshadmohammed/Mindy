type UserMessageProps = {
    message: string;
    date: string; // ISO string
};

function UserMessage({ message, date }: UserMessageProps) {
    const formattedTime = new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
        <div className="flex justify-end mb-2">
            <div className="flex items-start space-x-3 max-w-2xl">
                <div className="bg-green-500 rounded-2xl rounded-br-md px-4 py-3 max-w-md"> 
                    <p className="white text-right text-white">{message}</p>
                    <div className="text-xs text-white mt-1 text-right">{formattedTime}</div>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-gray-600 text-sm">person</span>
                </div>
            </div>
        </div>
    );
}




export default UserMessage;