// components/RetrievalPanel.tsx
import { RagMetadata } from "../hooks/UseConversation.ts";

interface RetrievalPanelProps {
    metadata: RagMetadata;
}

const approachLabel: Record<string, string> = {
    dense: "Dense",
    hybrid: "Hybrid (BM25 + Dense)",
    rerank: "Reranking",
};

const RetrievalPanel = ({ metadata }: RetrievalPanelProps) => {
    return (
        <div className="mt-3 pt-3 border-t border-gray-600 text-sm text-gray-200 space-y-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-gray-300 font-medium">
                    {approachLabel[metadata.approach] ?? metadata.approach}
                </span>
                <span className="text-gray-500">·</span>
                {metadata.ground_truth_in_pool
                    ? <span className="text-[#5BA3F5]">Ground truth found at rank #{metadata.ground_truth_rank}</span>
                    : <span className="text-[#FF8B5C]">Ground truth not in pool</span>
                }
            </div>

            <div className="space-y-1">
                {metadata.retrieval_pool.map((ctx) => (
                    <div
                        key={ctx.rank}
                        className={`flex gap-2 p-2 rounded-lg ${
                            ctx.is_ground_truth
                                ? "bg-[#0a1a2e] border border-[#246BCE]/60"
                                : "bg-[#1f1f1d]"
                        }`}>
                        <span className="text-gray-300 w-5 shrink-0 font-medium">#{ctx.rank}</span>
                        <p className="text-gray-200 line-clamp-2 leading-relaxed flex-1 min-w-0 break-words">
                            {ctx.text}
                        </p>
                        {ctx.is_ground_truth && (
                            <span className="shrink-0 text-green-400 font-semibold">GT</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RetrievalPanel;