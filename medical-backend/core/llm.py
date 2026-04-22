import os
import json
import re
from together import AsyncTogether, Together
from dotenv import load_dotenv

load_dotenv()

TOGETHER_API_KEY = os.getenv('TOGETHER_API_KEY')
MODEL = 'Qwen/Qwen3.5-397B-A17B'

sync_client = Together(api_key=TOGETHER_API_KEY)
async_client = AsyncTogether(api_key=TOGETHER_API_KEY)

SYSTEM_PROMPT = """You are a biomedical expert. Read the question and retrieved contexts carefully.

Based on the evidence provided, answer the question. Structure your response as:
- Start with yes, no, or maybe
- Follow with a clear explanation citing the evidence
- Be concise and precise

Always recommend consulting a healthcare professional for personal medical decisions."""

# ── PROMPT BUILDER

def build_prompt(question, contexts):
    context_block = ''
    for i, ctx in enumerate(contexts):
        text = ' '.join(ctx["text"].split()[:500])
        context_block += f'Context {i + 1}:\n{text}\n\n'
    return f'{context_block}Question: {question}'


# ── LABEL EXTRACTOR

def extract_label(text):
    text = text.strip().lower()
    match = re.search(r'\b(yes|no|maybe)\b', text)
    return match.group(1) if match else 'maybe'


# ── BLOCKING

def complete(question, contexts):
    response = sync_client.chat.completions.create(
        model=MODEL,
        messages=[
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': build_prompt(question, contexts)}
        ],
        max_tokens=512,
        temperature=0.0,
    )
    return response.choices[0].message.content


# ── STREAMING

async def stream(question, contexts, retrieval_results, approach):
    metadata = {
        'type': 'rag_metadata',
        'approach': approach,
        'retrieval_pool': retrieval_results,
        'ground_truth_in_pool': any(r['is_ground_truth'] for r in retrieval_results),
        'ground_truth_rank': next(
            (r['rank'] for r in retrieval_results if r['is_ground_truth']), None
        ),
    }
    yield json.dumps(metadata) + '\n'

    response = await async_client.chat.completions.create(
        model=MODEL,
        messages=[
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': build_prompt(question, contexts)}
        ],
        max_tokens=1024,
        temperature=0.7,
        top_p=0.8,
        presence_penalty=1.5,
        extra_body={
            "top_k": 20,
            "chat_template_kwargs": {"enable_thinking": False},
        },
        stream=True,
    )

    async for chunk in response:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
        elif chunk.choices and chunk.choices[0].delta.reasoning:
            pass