import ChatInput from "../components/ChatInput.tsx";
import { useConversation } from "../hooks/UseConversation.ts";
import RetrievalPanel from "../components/RetrievalPanel.tsx";
import Footer from "../components/Footer";
import { useEffect, useRef, useState } from "react";
import {  Copy, Check, Info } from "lucide-react";


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
    yes: "bg-[#0a1a2e] text-[#246BCE] border border-[#0f2a4a]",
    no: "bg-[#2a1200] text-[#E25822] border border-[#3d1a00]",
    maybe: "bg-[#2a2a2a] text-[#999] border border-[#3a3a3a]",
};

const BENCHMARKS = [
    { method: "Dense", accuracy: "77.1%", f1: "0.622", best: false },
    { method: "Hybrid", accuracy: "76.2%", f1: "0.612", best: false },
    { method: "Neural Reranker", accuracy: "77.0%", f1: "0.618", best: false },
    { method: "Hierarchical", accuracy: "77.2%", f1: "0.630", best: true  },
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
            className="ml-2 shrink-0 text-gray-600 hover:text-gray-300 transition-colors"
            title="Copy question">
            {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
    );
}

function BenchmarkTable() {
    return (
        <table className="w-full text-xs border-collapse">
            <thead>
            <tr>
                {["Method", "Accuracy", "F1"].map(h => (
                    <th key={h} className="text-left text-gray-600 font-normal px-2 py-1.5 border-b border-gray-800 uppercase tracking-widest text-[10px]">
                        {h}
                    </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {BENCHMARKS.map(({ method, accuracy, f1, best: best }) => (
                <tr key={method} className={best ? "bg-gray-800/40" : ""}>
                    <td className={`px-2 py-1.5 border-b border-gray-800/50 ${best ? "text-blue-400" : "text-gray-500"}`}>
                        {method}{best}
                    </td>
                    <td className={`px-2 py-1.5 border-b border-gray-800/50 ${best ? "text-gray-300" : "text-gray-500"}`}>{accuracy}</td>
                    <td className={`px-2 py-1.5 border-b border-gray-800/50 ${best ? "text-gray-300" : "text-gray-500"}`}>{f1}</td>
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
    const infoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
    }, [messages, loading])

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

    return (
        <div className="flex h-screen bg-[#111110] text-gray-200">

            <aside className="w-60 shrink-0 border-r border-gray-800 flex flex-col overflow-hidden bg-[#151513]">
                <div className="px-3 pt-3 pb-2.5 border-b border-gray-800 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Sample Questions</p>

                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-600 leading-snug"><b>Exact:</b> question from the PubMedQA dataset</p>
                        <p className="text-[10px] text-gray-600 leading-snug"><b>Natural:</b> same question, plain language</p>

                    </div>

                    <p className="text-[9px] text-gray-400 italic">Copy either to try it →</p>
                </div>
                <div className="flex-1 overflow-y-auto py-2 space-y-1">
                    {groups.map(group => (
                        <div key={group}>
                            <div className="px-3 pt-2 pb-1">
                                <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded ${BADGE_STYLES[group]}`}>
                                  {group}
                                </span>
                            </div>
                            {SAMPLE_QUESTIONS.filter(q => q.label === group).map(({ exact, natural }) => (
                                <div key={exact} className="px-3 py-2 hover:bg-gray-800/30 group space-y-1">
                                    <div className="flex gap-1.5 items-center">
                                        <p className="text-[11px] text-gray-600 group-hover:text-gray-400 leading-snug transition-colors font-mono">
                                            <span className='text-[12px] font-extrabold'>Exact</span><br/>
                                            {exact}
                                        </p>
                                        <CopyButton text={exact} />
                                    </div>
                                    <div className="flex gap-1.5 items-center">
                                        <p className="text-[11px] text-gray-600 group-hover:text-gray-400 leading-snug transition-colors font-mono">
                                            <br/><span className='text-[12px] font-extrabold'>Natural</span><br/>
                                            {natural}
                                        </p>
                                        <CopyButton text={natural} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-800 px-3 py-3 space-y-2">
                    <div>
                        <p className="text-[10px] text-gray-600 mb-0.5">Project page</p>
                        <a href="https://ascent.cysun.org/project/project/view/255" target="_blank" rel="noopener noreferrer"
                           className="text-[11px] text-[#0070BB] hover:text-blue-400 transition-colors">
                            Ascent
                        </a>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-600 mb-0.5">Source code</p>
                        <a href="https://github.com/CodingWithJoseph/MedicalChatApp" target="_blank" rel="noopener noreferrer"
                           className="text-[11px] text-[#0070BB] hover:text-blue-400 transition-colors">
                            GitHub
                        </a>
                    </div>
                </div>
            </aside>
            <div className="flex flex-col flex-1 overflow-hidden">
                {hasMessages && (
                    <div className="relative flex justify-end px-4 pt-2" ref={infoRef}>
                        <button onClick={() => setShowInfo(v => !v)} className="...">
                            <Info size={14} />
                        </button>
                        {showInfo && (
                            <div className="absolute top-9 right-4 w-72 bg-[#171715] border border-gray-700 rounded-lg p-3 z-10 shadow-xl">
                                <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-2">
                                    Benchmarks: Qwen3.5-397B-A17B
                                </p>
                                <BenchmarkTable />
                                <p className="text-[10px] text-gray-700 mt-2">
                                    Evaluated on 1000-question.
                                </p>
                            </div>
                        )}
                    </div>
                )}
                <div className="flex-1 overflow-y-auto px-6 py-4 max-w-3xl mx-auto w-full">
                    {!hasMessages && (
                        <div className="mt-16 space-y-5">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Powered by PubMedQA</p>
                                <h1 className="text-base text-gray-200 leading-snug">
                                    Compare four RAG retrieval strategies on real biomedical Q&A
                                </h1>
                                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                    Different retrieval approaches — Dense, Hybrid (Dense + BM25), Neural Reranker, and Hierarchical — produce
                                    meaningfully different answers to the same question. Ask anything below and see
                                    how Hierarchical retrieval compares against the benchmarks on the left.
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Benchmarks: Qwen3.5-397B-A17B</p>
                                <BenchmarkTable />
                                <p className="text-[10px] text-gray-700 mt-1.5">Evaluated on 1000-question held-out split.</p>
                            </div>
                            <div className='mt-20'>
                                <p className="text-[11px] text-gray-600 text-center">Ask a biomedical research question to get started.</p>
                            </div>
                        </div>
                    )}
                    <div className="space-y-4 mt-4">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                    message.role === "user" ? "bg-black text-white" : "text-gray-100"
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

                        {error && <p className="text-center text-red-400 text-sm">{error}</p>}
                        <div ref={bottomRef} />
                    </div>
                </div>

                <div className="px-4 pt-2 pb-2 max-w-3xl mx-auto w-full">
                    <ChatInput onSend={sendMessage} disabled={loading} />
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default Chat;