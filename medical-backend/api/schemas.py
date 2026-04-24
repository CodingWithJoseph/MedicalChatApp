from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str
    approach: str = 'dense'  # dense | hybrid | rerank