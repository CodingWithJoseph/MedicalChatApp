import {useState} from "react";

export interface RetrievedContext {
    rank: number
    abstract_idx: number
    text: string
    is_ground_truth: boolean
    score?: number
}

export interface RagMetadata {
    approach: string
    retrieval_pool: RetrievedContext[]
    ground_truth_in_pool: boolean
    ground_truth_rank: number | null
}

export interface Message {
    role: "user" | "assistant"
    content: string
    metadata?: RagMetadata
}

export const useConversation = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const sendMessage = async (content: string, approach: string = 'hierarchical') => {
        const userMessage: Message = {role: "user", content}
        setMessages(prev => [...prev, userMessage, {role: "assistant", content: "", metadata: undefined}])
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`https://medicalchatapp-production.up.railway.app/chat`, {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    question: content,
                    approach: approach
                })
            })

            const reader = res.body!.getReader()
            const decoder = new TextDecoder()

            let buffer = ""

            while (true) {
                const {done, value} = await reader.read()
                if (done) {
                    console.log("🏁 STREAM DONE - remaining buffer:", JSON.stringify(buffer))
                    if (buffer.trim()) {
                        const jsonStart = buffer.indexOf('{"type": "rag_metadata"')
                        if (jsonStart !== -1) {
                            const prefix = buffer.slice(0, jsonStart)
                            const jsonStr = buffer.slice(jsonStart)
                            if (prefix.trim()) {
                                setMessages(prev => {
                                    const updated = [...prev]
                                    const last = updated[updated.length - 1]
                                    updated[updated.length - 1] = {...last, content: last.content + prefix}
                                    return updated
                                })
                            }
                            try {
                                const parsed = JSON.parse(jsonStr)
                                if (parsed.type === 'rag_metadata') {
                                    console.log("✅ METADATA parsed from final buffer")
                                    setMessages(prev => {
                                        const updated = [...prev]
                                        updated[updated.length - 1].metadata = parsed
                                        return updated
                                    })
                                }
                            } catch {
                                console.log("❌ Failed to parse final buffer JSON")
                            }
                        } else {
                            setMessages(prev => {
                                const updated = [...prev]
                                const last = updated[updated.length - 1]
                                updated[updated.length - 1] = {...last, content: last.content + buffer}
                                return updated
                            })
                        }
                    }
                    break
                }

                buffer += decoder.decode(value, {stream: true})
                const newlineIdx = buffer.indexOf("\n")

                console.log("CHUNK:", JSON.stringify(buffer))
                console.log("newlineIdx:", newlineIdx, "buffer length:", buffer.length)

                if (newlineIdx !== -1) {
                    const line = buffer.slice(0, newlineIdx)
                    buffer = buffer.slice(newlineIdx + 1)

                    console.log("LINE:", JSON.stringify(line))
                    console.log("REMAINING BUFFER AFTER LINE:", JSON.stringify(buffer))

                    try {
                        const parsed = JSON.parse(line)
                        if (parsed.type === 'rag_metadata') {
                            console.log("✅ METADATA parsed successfully")
                            setMessages(prev => {
                                const updated = [...prev]
                                updated[updated.length - 1].metadata = parsed
                                return updated
                            })
                            continue
                        }
                    } catch {
                        console.log("❌ JSON.parse failed, treating as text:", JSON.stringify(line))
                    }

                    setMessages(prev => {
                        const updated = [...prev]
                        const last = updated[updated.length - 1]
                        updated[updated.length - 1] = {...last, content: last.content + line}
                        return updated
                    })
                } else {
                    console.log("⚠️ NO NEWLINE - flushing as text:", JSON.stringify(buffer))
                    const token = buffer
                    buffer = ""
                    setMessages(prev => {
                        const updated = [...prev]
                        const last = updated[updated.length - 1]
                        updated[updated.length - 1] = {...last, content: last.content + token}
                        return updated
                    })
                }
            }
        } catch {
            setError("Failed to reach the server.")
        } finally {
            setLoading(false)
        }
    }

    return {messages, sendMessage, loading, error}
}