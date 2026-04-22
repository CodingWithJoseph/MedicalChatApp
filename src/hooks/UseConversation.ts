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

    const sendMessage = async (content: string) => {
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
                    approach: "dense"
                })
            })

            const reader = res.body!.getReader()
            const decoder = new TextDecoder()

            let metadataParsed = false
            let buffer = ""

            while (true) {
                const {done, value} = await reader.read()
                if (done) break

                buffer += decoder.decode(value, {stream: true})

                if (!metadataParsed) {
                    const newlineIdx = buffer.indexOf("\n")
                    if (newlineIdx !== -1) {
                        const metadataChunk = buffer.slice(0, newlineIdx)
                        buffer = buffer.slice(newlineIdx + 1)
                        metadataParsed = true

                        try {
                            const metadata: RagMetadata = JSON.parse(metadataChunk)
                            console.log("metadata parsed", metadata)
                            setMessages(prev => {
                                const updated = [...prev]
                                updated[updated.length - 1].metadata = metadata
                                return updated
                            })
                        } catch {
                            const token = metadataChunk
                            setMessages(prev => {
                                const updated = [...prev]
                                const last = updated[updated.length - 1]
                                updated[updated.length - 1] = {...last, content: last.content + token}
                                return updated
                            })
                        }

                        if (buffer) {
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
                } else {
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