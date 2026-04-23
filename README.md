# PubMedQA RAG Comparison

A web application for comparing retrieval-augmented generation (RAG) strategies on biomedical yes/no/maybe questions from the PubMedQA dataset. Built as a Senior Design project at Cal State LA.

**[Live Demo](https://ascent.cysun.org/project/project/view/255)**

---

## Overview

Different retrieval approaches produce meaningfully different answers to the same biomedical question. This tool lets you interact with four RAG strategies and see how they perform against a held-out benchmark.

| Method | Accuracy | F1 |
|--------|----------|----|
| Dense | 77.1% | 0.622 |
| Hybrid (Dense + BM25) | 76.2% | 0.612 |
| Neural Reranker | 77.0% | 0.618 |
| **Hierarchical** | **77.2%** | **0.630** |

Evaluated on a 1000-question held-out split of PubMedQA using QWEN3.5-397B-A17B.

---

## Tech Stack

**Frontend** — React, TypeScript, Tailwind CSS, Vite  
**Backend** — Python  
**Dataset** — [PubMedQA](https://pubmedqa.github.io/) — peer-reviewed biomedical abstracts from PubMed  
**Model** — QWEN3.5-397B-A17B

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd medical-backend
pip install -r requirements.txt
python main.py
```

---

## Project Structure

```
MedicalChatApp/
├── src/                  # React frontend
│   ├── components/       # UI components
│   ├── hooks/            # Custom hooks
│   └── pages/            # Page components
├── medical-backend/      # Python backend
├── public/
└── index.html
```

---

## Team

**Cal State LA — Senior Design**

| Role | Name |
|------|------|
| Team Lead | Kenia Sanchez-Macario |
| Advisor | Dr. Yuqing Zhu (CSULA) |
| Liaison | TBD |
| Team | Christopher Gonzales, Rocio Hernandez, Joseph Howerton, Yvan Michel Kemsseu Yobeu, Haonan Ma, Steven Magana, Alan Mai, Georgina Mateo, Laura Rodriguez Zea, Kenia Sanchez-Macario, Sean Santos |