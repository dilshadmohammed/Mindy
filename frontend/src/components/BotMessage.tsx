import ReactMarkdown from "react-markdown";

type BotMessageProps = {
    message: string;
    date: string; // ISO string
};

function BotMessage({ message, date }: BotMessageProps) {
    const formattedTime = new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex justify-start mb-2">
            <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-sm">psychology</span>
                </div>
                <div className="bg-green-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-lg"> 
                    <p className="white text-left text-green-800">
                        <ReactMarkdown>{message}</ReactMarkdown>
                    </p>
                    <div className="text-xs text-green-800 mt-1 text-right">{formattedTime}</div>
                </div>
            </div>
        </div>
    );
}

export default BotMessage;