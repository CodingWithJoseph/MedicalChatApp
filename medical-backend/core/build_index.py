import os
import nltk
import faiss
import torch
import pickle
import numpy as np
from rank_bm25 import BM25Okapi
from datasets import load_dataset
from nltk.corpus import stopwords
from transformers import AutoTokenizer, AutoModel

nltk.download('stopwords')
CACHE_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'cache')
CONTEXT_ENCODER_NAME = 'ncbi/MedCPT-Article-Encoder'
CHUNK_SIZE = 500
OVERLAP = 30

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
stopwords = set(stopwords.words('english'))

def load_data():
    ds = load_dataset('qiaojin/PubMedQA', 'pqa_labeled', split='train')
    abstracts = []
    metadata = {}

    for i, item in enumerate(ds):
        abstract = ''.join(item['context']['contexts'])
        abstracts.append(abstract)
        metadata[item['question']] = i

    return abstracts, metadata

def chunkify(abstracts):
    chunks = []
    chunk_to_abstract = []
    step = CHUNK_SIZE - OVERLAP

    for i, abstract in enumerate(abstracts):
        words = abstract.split()
        for start in range(0, len(words), step):
            chunk = ' '.join(words[start:start + CHUNK_SIZE])
            chunks.append(chunk)
            chunk_to_abstract.append(i)

    return chunks, chunk_to_abstract


def encode_context(chunks):
    tokenizer = AutoTokenizer.from_pretrained(CONTEXT_ENCODER_NAME)
    model = AutoModel.from_pretrained(CONTEXT_ENCODER_NAME).to(device)
    model.eval()

    embeddings = []
    batch_size = 32

    with torch.no_grad():
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i: i + batch_size]
            tokens = tokenizer(
                batch,
                truncation=True,
                padding=True,
                return_tensors='pt',
                max_length=512
            ).to(device)

            out =  model(**tokens)
            emb = out.last_hidden_state[:, 0, :].cpu().numpy()
            embeddings.append(emb)

            if i % (4*batch_size) == 0:
                print(f'Encoded {i}/{len(chunks)} chunks')

    return np.vstack(embeddings)

def build_faiss(embeddings):
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)
    return index

def build_bm25(chunks):
    tokenized = [
        [w for w in chunk.lower().split() if w not in stopwords] for chunk in chunks
    ]
    return BM25Okapi(tokenized)

def cache(index, chunks, chunk_to_abstract, abstracts, bm25, metadata):
    os.makedirs(CACHE_DIR, exist_ok=True)

    faiss.write_index(index, os.path.join(CACHE_DIR, 'chunks.faiss'))

    with open(os.path.join(CACHE_DIR, 'chunks.pkl'), 'wb') as f:
        pickle.dump(chunks, f)

    with open(os.path.join(CACHE_DIR, 'chunk_to_abstract.pkl'), 'wb') as f:
        pickle.dump(chunk_to_abstract, f)

    with open(os.path.join(CACHE_DIR, 'abstracts.pkl'), 'wb') as f:
        pickle.dump(abstracts, f)

    with open(os.path.join(CACHE_DIR, 'bm25.pkl'), 'wb') as f:
        pickle.dump(bm25, f)

    with open(os.path.join(CACHE_DIR, 'metadata.pkl'), 'wb') as f:
        pickle.dump(metadata, f)

    print(f'Cache saved at {CACHE_DIR}')


if __name__ == '__main__':
    print('Loading data...')
    abst, mdata = load_data()
    print(f'Loaded {len(abst)} abstracts')

    print('Chunking...')
    cs, cta = chunkify(abst)
    print(f'Created {len(cs)} chunks')

    print('Encoding chunks...')
    embs = encode_context(cs)
    print(f'Embeddings shape: {embs.shape}')

    print('Building FAISS index...')
    idx = build_faiss(embs)

    print('Building BM25 index...')
    b25 = build_bm25(cs)

    print('Saving cache...')
    cache(idx, cs, cta, abst, b25, mdata)

    print('Done.')