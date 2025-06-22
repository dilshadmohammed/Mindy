import TypingIndicator from './TypingIndicator'

function BotTyping() {
  return (
    <div>
      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-white text-sm">psychology</span>
      </div>
      <TypingIndicator />
    </div>
  )
}

export default BotTyping