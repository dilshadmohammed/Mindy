type BotMessageProps = {
    message: string;
};

function BotMessage({ message }: BotMessageProps) {
    return (
        <div className="flex justify-start mb-2">
            <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-sm">psychology</span>
                </div>
                <div className="pl-2 prose prose-sm max-w-none">
                    <p className="text-gray-800 bg-white rounded-2xl px-4 py-2 shadow-sm">{message}</p>
                    <div className="text-xs text-gray-300 mt-1">2:34 PM</div>
                </div>
            </div>
        </div>
    );
}

export default BotMessage;