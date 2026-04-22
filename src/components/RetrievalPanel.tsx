import {RagMetadata} from "../hooks/UseConversation.ts"

interface RetrievalPanelProps {
    metadata: RagMetadata
}

const approachLabel: Record<string, string> = {
    dense: "Dense",
    hybrid: "Hybrid (BM25 + Dense)",
    rerank: "Reranking"
}

const RetrievalPanel = ({metadata}: RetrievalPanelProps) => {
    return (
        <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400 space-y-2">

            <div className="flex items-center gap-3">
                <span className="text-gray-500">
                    {approachLabel[metadata.approach] ?? metadata.approach}
                </span>
                <span>·</span>
                {metadata.ground_truth_in_pool
                    ? <span className="text-green-400">Ground truth found at rank #{metadata.ground_truth_rank}</span>
                    : <span className="text-red-400">Ground truth not in pool</span>
                }
            </div>

            <div className="space-y-1">
                {metadata.retrieval_pool.map((ctx) => (
                    <div
                        key={ctx.rank}
                        className={`flex gap-2 p-2 rounded-lg ${
                            ctx.is_ground_truth
                                ? "bg-green-950 border border-green-800"
                                : "bg-[#1a1a1a]"
                        }`}
                    >
                        <span className="text-gray-600 w-4 shrink-0">#{ctx.rank}</span>
                        <p className="text-gray-400 line-clamp-2 leading-relaxed">
                            {ctx.text}
                        </p>
                        {ctx.is_ground_truth && (
                            <span className="shrink-0 text-green-400 font-medium">GT</span>
                        )}
                    </div>
                ))}
            </div>

        </div>
    )
}

export default RetrievalPanel