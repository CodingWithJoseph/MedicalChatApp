from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import CrossEncoder
from core.retrieve import load_cache, load_query_encoder
from api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print('Loading cache...')
    index, chunks, chunk_to_abstract, abstracts, bm25, metadata = load_cache()

    print('Loading query encoder...')
    query_tokenizer, query_model = load_query_encoder()

    print('Loading reranker...')
    reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

    app.state.index = index
    app.state.chunks = chunks
    app.state.chunk_to_abstract = chunk_to_abstract
    app.state.abstracts = abstracts
    app.state.bm25 = bm25
    app.state.metadata = metadata
    app.state.query_tokenizer = query_tokenizer
    app.state.query_model = query_model
    app.state.reranker_tokenizer = reranker.tokenizer
    app.state.reranker_model = reranker.model

    print('Ready.')
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],  # update with your frontend URL before deploying
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(router)