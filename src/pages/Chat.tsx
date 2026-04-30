// pages/Chat.tsx
import ChatInput from "../components/ChatInput.tsx";
import { useConversation } from "../hooks/UseConversation.ts";
import RetrievalPanel from "../components/RetrievalPanel.tsx";
import Footer from "../components/Footer";
import { useEffect, useRef, useState } from "react";
import { Copy, Check, Info, Menu, X } from "lucide-react";

const SAMPLE_QUESTIONS = [
    {
        label: "yes",
        exact: "Do mitochondria play a role in remodelling lace plant leaves during programmed cell death?",
        natural: "Do mitochondria help shape how lace plant leaves break down as they die?",
    },
    {
        label: "no",
        exact: "Do mutations causing low HDL-C promote increased carotid intima-media thickness?",
        natural: "Do genetic mutations that lower good cholesterol lead to thicker artery walls?",
    },
    {
        label: "maybe",
        exact: "Can omega-3 supplementation reduce depressive symptoms?",
        natural: "Can fish oil help with depression?",
    },
];

const BADGE_STYLES: Record<string, string> = {
    yes: "bg-[#0a1a2e] text-[#5BA3F5] border border-[#1a3a5e]",
    no: "bg-[#2a1200] text-[#FF8B5C] border border-[#5d2a10]",
    maybe: "bg-[#2a2a2a] text-gray-300 border border-[#4a4a4a]",
};

const BENCHMARKS = [
    { method: "Dense", accuracy: "77.1%", f1: "0.622", best: false },
    { method: "Hybrid", accuracy: "76.2%", f1: "0.612", best: false },
    { method: "Neural Reranker", accuracy: "77.0%", f1: "0.618", best: false },
    { method: "Hierarchical", accuracy: "77.2%", f1: "0.630", best: true },
];

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button
            onClick={handleCopy}
            className="ml-2 shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
            title="Copy question">
            {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
    );
}

function BenchmarkTable() {
    return (
        <table className="w-full text-sm border-collapse">
            <thead>
            <tr>
                {["Method", "Accuracy", "F1"].map(h => (
                    <th key={h} className="text-left text-gray-400 font-normal px-2 py-1.5 border-b border-gray-700 uppercase tracking-widest text-xs">
                        {h}
                    </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {BENCHMARKS.map(({ method, accuracy, f1, best }) => (
                <tr key={method} className={best ? "bg-gray-800/40" : ""}>
                    <td className={`px-2 py-1.5 border-b border-gray-800/50 ${best ? "text-blue-400 font-medium" : "text-gray-300"}`}>
                        {method}
                    </td>
                    <td className={`px-2 py-1.5 border-b border-gray-800/50 ${best ? "text-gray-100" : "text-gray-300"}`}>{accuracy}</td>
                    <td className={`px-2 py-1.5 border-b border-gray-800/50 ${best ? "text-gray-100" : "text-gray-300"}`}>{f1}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

const Chat = () => {
    const { messages, sendMessage, loading, error } = useConversation();
    const bottomRef = useRef<HTMLDivElement>(null);
    const [showInfo, setShowInfo] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const infoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, [messages, loading]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
                setShowInfo(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const hasMessages = messages.length > 0;
    const groups = ["yes", "no", "maybe"] as const;

    const sidebarBody = (
        <>
            <div className="px-3 pt-3 pb-2.5 border-b border-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-widest text-gray-200 font-medium">Sample Questions</p>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden text-gray-300 hover:text-white"
                        aria-label="Close menu">
                        <X size={18} />
                    </button>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-gray-300 leading-snug"><b className="text-gray-100">Exact:</b> question from the PubMedQA dataset</p>
                    <p className="text-sm text-gray-300 leading-snug"><b className="text-gray-100">Natural:</b> same question, plain language</p>
                </div>
                <p className="text-sm text-gray-100 italic">Copy to try it →</p>
            </div>
            <div className="flex-1 overflow-y-auto py-2 space-y-1">
                {groups.map(group => (
                    <div key={group}>
                        <div className="px-3 pt-2 pb-1">
                            <span className={`text-xs uppercase tracking-widest px-2 py-0.5 rounded font-medium ${BADGE_STYLES[group]}`}>
                                {group}
                            </span>
                        </div>
                        {SAMPLE_QUESTIONS.filter(q => q.label === group).map(({ exact, natural }) => (
                            <div key={exact} className="px-3 py-2 hover:bg-gray-800/30 group space-y-1">
                                <div className="flex gap-1.5 items-start">
                                    <p className="text-sm text-gray-300 group-hover:text-gray-100 leading-snug transition-colors font-mono flex-1 min-w-0">
                                        <span className="text-xs font-extrabold text-gray-100">Exact</span><br/>
                                        {exact}
                                    </p>
                                    <CopyButton text={exact} />
                                </div>
                                <div className="flex gap-1.5 items-start">
                                    <p className="text-sm text-gray-300 group-hover:text-gray-100 leading-snug transition-colors font-mono flex-1 min-w-0">
                                        <br/><span className="text-xs font-extrabold text-gray-100">Natural</span><br/>
                                        {natural}
                                    </p>
                                    <CopyButton text={natural} />
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-700 px-3 py-3 space-y-2">
                <div>
                    <p className="text-sm text-gray-400 mb-0.5">Project page</p>
                    <a href="https://ascent.cysun.org/project/project/view/255" target="_blank" rel="noopener noreferrer"
                       className="text-sm text-[#3B9EFF] hover:text-blue-300 transition-colors">
                        Ascent
                    </a>
                </div>
                <div>
                    <p className="text-sm text-gray-400 mb-0.5">Source code</p>
                    <a href="https://github.com/CodingWithJoseph/MedicalChatApp" target="_blank" rel="noopener noreferrer"
                       className="text-sm text-[#3B9EFF] hover:text-blue-300 transition-colors">
                        GitHub
                    </a>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-[#111110] text-gray-200">
            <aside className="hidden md:flex w-68 shrink-0 border-r border-gray-700 flex-col overflow-hidden bg-[#151513]">
                {sidebarBody}
            </aside>

            {sidebarOpen && (
                <>
                    <div
                        className="md:hidden fixed inset-0 bg-black/60 z-20"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="md:hidden fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] border-r border-gray-700 flex flex-col overflow-hidden bg-[#151513] z-30">
                        {sidebarBody}
                    </aside>
                </>
            )}

            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                <div className="relative flex items-center justify-between px-3 sm:px-4 pt-2 min-h-[36px]" ref={infoRef}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden text-gray-300 hover:text-white p-1.5 -ml-1.5"
                        aria-label="Open menu">
                        <Menu size={20} />
                    </button>
                    <div className="flex-1" />
                    {hasMessages && (
                        <button
                            onClick={() => setShowInfo(v => !v)}
                            className="text-gray-300 hover:text-white p-1.5"
                            aria-label="Show benchmarks">
                            <Info size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => setShowInfo(v => !v)}
                        className={`text-gray-300 hover:text-white p-1.5 ${hasMessages ? "" : "md:hidden"}`}
                        aria-label="Show benchmarks">
                        <Info size={18} />
                    </button>
                    {showInfo && (
                        <div className="absolute top-10 right-3 sm:right-4 w-80 max-w-[calc(100vw-1.5rem)] bg-[#1a1a18] border border-gray-700 rounded-lg p-3 z-10 shadow-xl">
                            <p className="text-xs uppercase tracking-widest text-gray-300 mb-2 font-medium">
                                Benchmarks: Qwen3.5-397B-A17B
                            </p>
                            <BenchmarkTable />
                            <p className="text-xs text-gray-400 mt-2">
                                Evaluated on 1000-question held-out split.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 max-w-3xl mx-auto w-full">
                    {!hasMessages && (
                        <div className="mt-12 sm:mt-16 space-y-5">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-medium">Powered by PubMedQA</p>
                                <h1 className="text-lg sm:text-xl text-gray-100 leading-snug">
                                    Compare four RAG retrieval strategies on real biomedical Q&amp;A
                                </h1>
                                <p className="text-sm sm:text-base text-gray-300 mt-2 leading-relaxed">
                                    <span className="hidden sm:inline">
                                        Different retrieval approaches — Dense, Hybrid (Dense + BM25), Neural Reranker, and Hierarchical — produce
                                        meaningfully different answers to the same question. Ask anything below and see
                                        how Hierarchical retrieval compares against the benchmarks on the left.
                                    </span>
                                    <span className="sm:hidden">
                                        Ask a question and see how Hierarchical retrieval compares to Dense, Hybrid, and Neural Reranker.
                                    </span>
                                </p>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-medium">Benchmarks: Qwen3.5-397B-A17B</p>
                                <BenchmarkTable />
                                <p className="text-xs text-gray-400 mt-1.5">Evaluated on 1000-question held-out split.</p>
                            </div>
                            <div className="mt-20 hidden sm:block">
                                <p className="text-sm text-gray-400 text-center">Ask a biomedical research question to get started.</p>
                            </div>
                        </div>
                    )}
                    <div className="space-y-4 mt-4">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                    message.role === "user" ? "bg-black text-white" : "text-gray-100"
                                }`}>
                                    {message.content}
                                    {message.metadata && (
                                        <RetrievalPanel metadata={message.metadata} />
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && messages[messages.length - 1]?.content === "" && (
                            <div className="flex justify-start">
                                <div className="bg-[#2a2a2a] border border-gray-600 rounded-2xl px-4 py-3 text-sm text-gray-200">
                                    Thinking...
                                </div>
                            </div>
                        )}

                        {error && <p className="text-center text-red-400 text-sm">{error}</p>}
                        <div ref={bottomRef} />
                    </div>
                </div>

                <div className="px-3 sm:px-4 pt-2 pb-2 max-w-3xl mx-auto w-full">
                    <ChatInput onSend={sendMessage} disabled={loading} />
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default Chat;