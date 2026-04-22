from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from core.retrieve import (
    dense_retrieve,
    hybrid_retrieve,
    rerank_retrieve,
)
from core.llm import stream
from api.schemas import ChatRequest

router = APIRouter()


def get_retrieval_results(question, approach, request):
    index = request.app.state.index
    chunks = request.app.state.chunks
    chunk_to_abstract = request.app.state.chunk_to_abstract
    abstracts = request.app.state.abstracts
    bm25 = request.app.state.bm25
    metadata = request.app.state.metadata
    query_tokenizer = request.app.state.query_tokenizer
    query_model = request.app.state.query_model

    if approach == 'dense':
        return dense_retrieve(
            question, index, chunk_to_abstract, abstracts,
            metadata, query_tokenizer, query_model
        )
    elif approach == 'hybrid':
        return hybrid_retrieve(
            question, index, chunks, chunk_to_abstract, abstracts,
            bm25, metadata, query_tokenizer, query_model
        )
    elif approach == 'rerank':
        return rerank_retrieve(
            question, index, chunks, chunk_to_abstract, abstracts,
            bm25, metadata, query_tokenizer, query_model,
            request.app.state.reranker_tokenizer,
            request.app.state.reranker_model
        )
    else:
        raise ValueError(f'Unknown approach: {approach}')


@router.post('/chat')
async def chat(body: ChatRequest, request: Request):
    retrieval_results = get_retrieval_results(
        body.question, body.approach, request
    )

    contexts = retrieval_results[:3]

    return StreamingResponse(
        stream(body.question, contexts, retrieval_results, body.approach),
        media_type='text/plain'
    )