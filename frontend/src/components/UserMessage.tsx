type UserMessageProps = {
    message: string;
};

function UserMessage({ message }: UserMessageProps) {
    return (
        <div className="flex justify-end mb-2">
            <div className="flex items-start space-x-3">
                <div className="pr-2">
                    <p className="text-gray-800 text-right bg-green-50 rounded-2xl px-4 py-2 shadow-sm">{message}</p>
                    <div className="text-xs text-gray-300 mt-1 text-right">2:35 PM</div>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-gray-600 text-sm">person</span>
                </div>
            </div>
        </div>
    );
}

export default UserMessage;