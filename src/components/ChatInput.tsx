import {useState, useRef, useEffect} from "react";
import { ChevronUp, ChevronDown } from "lucide-react";


type Approach = "hierarchical" | "dense" | "hybrid" | "rerank"

const APPROACH_LABELS: Record<Approach, string> = {
    hierarchical: "Hierarchical",
    dense: "Dense",
    hybrid: "Hybrid",
    rerank: "Rerank",
}

interface ChatInputProps {
    onSend: (message: string, approach: Approach) => void;
    disabled?: boolean;
}

const ChatInput = ({onSend, disabled}: ChatInputProps) => {
    const [input, setInput] = useState("")
    const [approach, setApproach] = useState<Approach>("hierarchical")
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const handleSend = () => {
        if (!input.trim()) return
        onSend(input, approach)
        setInput("")
    }

    return (
        <div className="flex flex-col gap-2">

            <div ref={dropdownRef} className="relative" style={{width: "160px"}}>
                <button
                    type="button"
                    onClick={() => !disabled && setOpen(o => !o)}
                    disabled={disabled}
                    className="w-full flex items-center justify-between gap-2 bg-[#2a2a2a] border border-gray-700
                               text-gray-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none
                               focus:border-blue-500 transition-colors cursor-pointer disabled:opacity-40">
                    <span>{APPROACH_LABELS[approach]}</span>
                    <span className="text-gray-500">
                        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                </button>

                {open && (
                    <div className="absolute bottom-full mb-1 left-0 w-full bg-[#2a2a2a] border border-gray-700
                                    rounded-xl overflow-hidden z-10 shadow-lg">
                        {(Object.keys(APPROACH_LABELS) as Approach[]).map(key => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => { setApproach(key); setOpen(false) }}
                                className={`w-full text-left px-2 py-2.5 text-sm transition-colors
                                    ${approach === key
                                    ? "text-white bg-[#3a3a3a]"
                                    : "text-gray-300 hover:bg-[#333333]"
                                }`}
                            >
                                {APPROACH_LABELS[key]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-3 items-end w-full">
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
                               text-white text-sm rounded-xl transition-colors">
                    Send
                </button>
            </div>
        </div>
    )
}

export default ChatInput