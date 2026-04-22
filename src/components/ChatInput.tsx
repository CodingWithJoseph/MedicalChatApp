import {useState} from "react";


interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

const ChatInput = ({onSend, disabled}: ChatInputProps) => {
    const [input, setInput] = useState("");

    const handleSend = () => {
        if(!input.trim()) return;
        onSend(input);
        setInput("")
    }

    return (
        <div className="flex gap-3 items-end">
        <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                }
            }}
            disabled={disabled}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-700 bg-[#2a2a2a]
                       text-gray-100 placeholder-gray-500 px-4 py-3 text-sm
                       focus:outline-none focus:border-blue-500 transition-colors"
        />
            <button
                onClick={handleSend}
                disabled={disabled || !input.trim()}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40
                       text-white text-sm rounded-xl transition-colors"
            >
                Send
            </button>
        </div>
    )
}

export default ChatInput