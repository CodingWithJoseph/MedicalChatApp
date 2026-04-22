from pydantic import BaseModel
from typing import List, Optional

# ── REQUEST SCHEMAS ───────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str
    approach: str = 'dense'  # dense | hybrid | rerank


# ── RESPONSE SCHEMAS ──────────────────────────────────────────────────────────

class RetrievedContext(BaseModel):
    rank: int
    abstract_idx: int
    text: str
    is_ground_truth: bool
    score: Optional[float] = None


class RagMetadata(BaseModel):
    type: str
    approach: str
    retrieval_pool: List[RetrievedContext]
    ground_truth_in_pool: bool
    ground_truth_rank: Optional[int]