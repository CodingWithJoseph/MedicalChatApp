# Clinical RAG System

A biomedical Q&A chatbot. You ask a medical question, it finds the most relevant research from PubMedQA, and uses an LLM to generate an answer based on that evidence.

---

## How It Works

**1. Before the server starts — build the index**
All 1,000 PubMedQA abstracts are chunked into 500-word pieces and encoded into vectors using a biomedical AI model (MedCPT). These vectors are saved to disk so the server doesn't have to recompute them.

**2. When the server starts**
It loads the saved index, encoders, and a reranking model into memory so they're ready to use instantly on every request.

**3. When you ask a question**
Your question goes through one of three retrieval strategies to find the most relevant abstracts:

- **Dense** — converts your question into a vector and finds the closest matching abstracts by similarity
- **Hybrid** — combines the dense search above with a keyword search (BM25), merging both result lists for better coverage
- **Rerank** — runs hybrid first, then re-scores every candidate by reading your question and each abstract together, picking the best matches

**4. The top 3 abstracts are passed to the LLM**
Qwen (hosted on Together.ai) reads the question and the retrieved evidence, then streams back a yes/no/maybe answer with an explanation.

---

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Add your Together.ai key
echo "TOGETHER_API_KEY=your_key_here" > .env

# Build the index (run once, takes ~20 min with GPU)
python core/build_index.py

# Start the server
uvicorn api.main:app --reload
```

---

## Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI |
| Retrieval | FAISS + BM25 + MedCPT |
| Reranker | ms-marco-MiniLM cross-encoder |
| LLM | Qwen 3.5 via Together.ai |
| Frontend | React + Vite |
| Dataset | PubMedQA (1,000 labeled abstracts) |