import {useConversation} from "../hooks/UseConversation.ts";
import ChatInput from "../components/ChatInput.tsx";

const Chat = () => {

    const {messages, sendMessage, loading, error} = useConversation()

    return (
        <div className="flex flex-col h-screen bg-[#1a1a1a]">

            {/* Message feed — scrollable, takes all space above input */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 mt-32 text-sm">
                        Ask a medical question to get started
                    </p>
                )}

                {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            message.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-[#2a2a2a] text-gray-100 border border-gray-700"
                        }`}>
                            {message.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-[#2a2a2a] border border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-400">
                            Thinking...
                        </div>
                    </div>
                )}

                {error && (
                    <p className="text-center text-red-400 text-sm">{error}</p>
                )}
            </div>

            {/* Input — always pinned to bottom */}
            <div className="border-t border-gray-800 bg-[#1a1a1a] px-4 py-4">
                <div className="max-w-3xl mx-auto">
                    <ChatInput onSend={sendMessage} disabled={loading} />
                </div>
            </div>

        </div>
    )
}

export default Chat