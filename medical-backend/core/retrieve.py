import os
import pickle
import faiss
import numpy as np
from transformers import AutoTokenizer, AutoModel
import torch
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords', quiet=True)

CACHE_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'cache')
QUERY_ENCODER_NAME = 'ncbi/MedCPT-Query-Encoder'

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
stop_words = set(stopwords.words('english'))


# ── LOAD CACHE ────────────────────────────────────────────────────────────────

def load_cache():
    index = faiss.read_index(os.path.join(CACHE_DIR, 'chunks.faiss'))

    with open(os.path.join(CACHE_DIR, 'chunks.pkl'), 'rb') as f:
        chunks = pickle.load(f)

    with open(os.path.join(CACHE_DIR, 'chunk_to_abstract.pkl'), 'rb') as f:
        chunk_to_abstract = pickle.load(f)

    with open(os.path.join(CACHE_DIR, 'abstracts.pkl'), 'rb') as f:
        abstracts = pickle.load(f)

    with open(os.path.join(CACHE_DIR, 'bm25.pkl'), 'rb') as f:
        bm25 = pickle.load(f)

    with open(os.path.join(CACHE_DIR, 'metadata.pkl'), 'rb') as f:
        metadata = pickle.load(f)

    return index, chunks, chunk_to_abstract, abstracts, bm25, metadata


# ── QUERY ENCODER

def load_query_encoder():
    tokenizer = AutoTokenizer.from_pretrained(QUERY_ENCODER_NAME)
    model = AutoModel.from_pretrained(QUERY_ENCODER_NAME).to(device)
    model.eval()
    return tokenizer, model


def encode_query(question, tokenizer, model):
    tokens = tokenizer(
        question,
        truncation=True,
        padding=True,
        return_tensors='pt',
        max_length=512
    ).to(device)

    with torch.no_grad():
        out = model(**tokens)

    return out.last_hidden_state[:, 0, :].cpu().numpy()


# ── SHARED UTILITY

def resolve_abstracts(ranked_abstract_indices, abstracts, gt_abstract_idx, k):
    seen = set()
    results = []

    for rank, abstract_idx in enumerate(ranked_abstract_indices):
        if abstract_idx in seen:
            continue
        seen.add(abstract_idx)

        results.append({
            'rank': len(results) + 1,
            'abstract_idx': abstract_idx,
            'text': abstracts[abstract_idx],
            'is_ground_truth': abstract_idx == gt_abstract_idx,
        })

        if len(results) == k:
            break

    return results


def get_gt_index(question, metadata):
    return metadata.get(question, None)


# ── DENSE RETRIEVER

def dense_retrieve(question, index, chunk_to_abstract, abstracts, metadata,
                   query_tokenizer, query_model, k=5, pool_size=50):

    gt_abstract_idx = get_gt_index(question, metadata)
    query_vec = encode_query(question, query_tokenizer, query_model)

    _, chunk_indices = index.search(query_vec, pool_size * 3)

    abstract_indices = [chunk_to_abstract[i] for i in chunk_indices[0]]
    return resolve_abstracts(abstract_indices, abstracts, gt_abstract_idx, k)


# ── HYBRID RETRIEVER (BM25 + DENSE + RRF)

def hybrid_retrieve(question, index, chunks, chunk_to_abstract, abstracts,
                    bm25, metadata, query_tokenizer, query_model,
                    k=5, pool_size=50):

    gt_abstract_idx = get_gt_index(question, metadata)

    # BM25
    tokenized_query = [w for w in question.lower().split() if w not in stop_words]
    bm25_scores = bm25.get_scores(tokenized_query)
    bm25_chunk_indices = np.argsort(bm25_scores)[::-1][:pool_size * 3]

    # Dense
    query_vec = encode_query(question, query_tokenizer, query_model)
    _, faiss_chunk_indices = index.search(query_vec, pool_size * 3)
    faiss_chunk_indices = faiss_chunk_indices[0]

    # RRF over chunk indices, then map to abstracts
    rrf_scores = {}
    for rank, chunk_idx in enumerate(bm25_chunk_indices):
        abstract_idx = chunk_to_abstract[chunk_idx]
        rrf_scores[abstract_idx] = rrf_scores.get(abstract_idx, 0) + 1 / (60 + rank)

    for rank, chunk_idx in enumerate(faiss_chunk_indices):
        abstract_idx = chunk_to_abstract[chunk_idx]
        rrf_scores[abstract_idx] = rrf_scores.get(abstract_idx, 0) + 1 / (60 + rank)

    ranked = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
    ranked_abstract_indices = [idx for idx, _ in ranked]

    return resolve_abstracts(ranked_abstract_indices, abstracts, gt_abstract_idx, k)


# ── RERANKER

def rerank_retrieve(question, index, chunks, chunk_to_abstract, abstracts,
                    bm25, metadata, query_tokenizer, query_model,
                    reranker_tokenizer, reranker_model,
                    k=5, pool_size=50):

    # Start from hybrid results but get a larger pool to rerank
    candidates = hybrid_retrieve(
        question, index, chunks, chunk_to_abstract, abstracts,
        bm25, metadata, query_tokenizer, query_model,
        k=pool_size, pool_size=pool_size
    )

    gt_abstract_idx = get_gt_index(question, metadata)

    # Score each candidate with the cross-encoder
    pairs = [[question, c['text'][:512]] for c in candidates]
    scores = []

    reranker_model.eval()
    with torch.no_grad():
        for pair in pairs:
            tokens = reranker_tokenizer(
                pair[0],
                pair[1],
                truncation=True,
                padding=True,
                return_tensors='pt',
                max_length=512
            ).to(device)
            score = reranker_model(**tokens).logits.squeeze().item()
            scores.append(score)

    ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)

    results = []
    for rank, (candidate, score) in enumerate(ranked[:k]):
        results.append({
            'rank': rank + 1,
            'abstract_idx': candidate['abstract_idx'],
            'text': candidate['text'],
            'is_ground_truth': candidate['abstract_idx'] == gt_abstract_idx,
            'score': round(score, 4),
        })

    return results


def hierarchical_retrieve(question, index, chunk_to_abstract, abstracts,
                          metadata, query_tokenizer, query_model,
                          k=5, pool_size=50):

    gt_abstract_idx = get_gt_index(question, metadata)
    query_vec = encode_query(question, query_tokenizer, query_model)

    scores, chunk_indices = index.search(query_vec, pool_size * 3)
    chunk_indices = chunk_indices[0]
    scores = scores[0]

    # aggregate chunk scores per parent abstract using max
    abstract_scores = {}
    for chunk_idx, score in zip(chunk_indices, scores):
        abstract_idx = chunk_to_abstract[chunk_idx]
        if abstract_idx not in abstract_scores:
            abstract_scores[abstract_idx] = score
        else:
            abstract_scores[abstract_idx] = max(abstract_scores[abstract_idx], score)

    ranked = sorted(abstract_scores.items(), key=lambda x: x[1], reverse=True)

    results = []
    for rank, (abstract_idx, score) in enumerate(ranked[:k]):
        results.append({
            'rank': rank + 1,
            'abstract_idx': abstract_idx,
            'text': abstracts[abstract_idx],
            'is_ground_truth': abstract_idx == gt_abstract_idx,
            'score': round(float(score), 4),
        })

    return results