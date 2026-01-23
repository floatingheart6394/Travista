# RAG Bot Quick Reference

## File Structure
```
backend/app/rag/
├── __init__.py (empty)
├── data/
│   ├── travel_tips.txt
│   ├── popular_destinations.txt
│   ├── accommodation_guide.txt
│   └── transportation_guide.txt
├── embedder.py          # Text → Embeddings (OpenAI)
├── loader.py            # Load .txt files from data/
├── vector_store.py      # FAISS vector database
├── retriever.py         # Find relevant documents
├── generator.py         # Generate answers with LLM
└── pipeline.py          # Orchestrate RAG flow
```

## Quick Start

### 1. Start Server
```bash
cd backend
uvicorn app.main:app --reload
```

### 2. Test with Python
```python
from app.rag.pipeline import rag_pipeline

result = rag_pipeline("Best budget airlines in Europe?")
print(result['answer'])
print(result['context_used'])
```

### 3. Test with cURL
```bash
curl -X POST "http://localhost:8000/ai/rag-chat" \
  -H "Content-Type: application/json" \
  -d '{"question": "How to find cheap flights?"}'
```

## Key Functions

### Pipeline
```python
from app.rag.pipeline import rag_pipeline, initialize_rag

# Initialize on startup
initialize_rag("app/rag/data")

# Use in routes
result = rag_pipeline("user question")
```

### Retriever
```python
from app.rag.retriever import retrieve_context

context = retrieve_context("question", k=5)  # Get top 5 docs
```

### Generator
```python
from app.rag.generator import generate_answer

answer = generate_answer("question", "context")
```

## Adding Training Data

1. Create `backend/app/rag/data/my_topic.txt`
2. Add content in plain text (no markdown)
3. Restart server
4. Done! Vector store auto-loads new data

## Configuration

**OpenAI Settings** (`app/core/openai_client.py`):
- Model: `gpt-4o-mini`
- Temperature: 0.7
- Max Tokens: 400

**Retrieval Settings** (`app/rag/retriever.py`):
- Default k: 3 (top 3 documents)
- Similarity metric: Cosine distance

## Debugging

### Check loaded documents
```python
from app.rag.loader import load_documents
docs = load_documents("backend/app/rag/data")
print(f"Loaded {len(docs)} documents")
```

### Test embeddings
```python
from app.rag.embedder import get_embedder
embedder = get_embedder()
embedding = embedder.embed_query("test query")
print(f"Embedding dimension: {len(embedding)}")
```

### Test vector store
```python
from app.rag.vector_store import get_vector_store
vs = get_vector_store()
results = vs.similarity_search("budget travel", k=2)
for doc in results:
    print(doc.page_content[:100])
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "No module named 'fastapi'" | `pip install fastapi uvicorn` |
| "No documents found" | Add .txt files to `backend/app/rag/data/` |
| "OpenAI API error" | Check `OPENAI_API_KEY` in .env |
| "Import not resolved" | Restart VS Code or check Python path |

## Performance

| Operation | Time |
|-----------|------|
| Embed 1 document | ~100ms |
| Search similar docs | ~10ms |
| Generate answer | ~2-5s |
| Full request | ~2-6s |

## Enhancement Ideas

- [ ] Add conversation history
- [ ] Implement document metadata
- [ ] Add user feedback loop
- [ ] Cache frequent questions
- [ ] Support multiple languages
- [ ] Real-time travel data integration
- [ ] Response confidence scores
- [ ] A/B testing different prompts

## Testing

Run the test script:
```bash
python test_rag_bot.py
```

This verifies:
- ✓ Data files exist
- ✓ Modules import correctly
- ✓ Documents load
- ✓ Vector store initializes
- ✓ RAG pipeline works
- ✓ Endpoints are available

---

**Tip**: Check `RAG_BOT_GUIDE.md` for comprehensive documentation!
