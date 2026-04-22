import ChatInput from "../components/ChatInput.tsx";
import {useConversation} from "../hooks/UseConversation.ts";
import RetrievalPanel from "../components/RetrievalPanel.tsx";
import {useEffect, useRef} from "react"

const NewChat = () => {
    const {messages, sendMessage, loading, error} = useConversation()
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messages])

    return (
        <div className="flex flex-col h-screen mx-100">
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
                                ? "bg-black text-white"
                                : "text-gray-100"
                        }`}>
                            {message.content}
                            {message.role === "assistant" && message.metadata && !loading && (
                                <RetrievalPanel metadata={message.metadata} />
                            )}
                        </div>
                    </div>
                ))}

                {loading && messages[messages.length - 1]?.content === "" && (
                    <div className="flex justify-start">
                        <div className="bg-[#2a2a2a] border border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-400">
                            Thinking...
                        </div>
                    </div>
                )}

                {error && (
                    <p className="text-center text-red-400 text-sm">{error}</p>
                )}

                <div ref={bottomRef} />
            </div>

            <div className="px-4 py-4">
                <div className="max-w-3xl mx-auto">
                    <ChatInput onSend={sendMessage} disabled={loading} />
                </div>
            </div>
        </div>
    )
}

export default NewChat