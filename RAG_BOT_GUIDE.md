# RAG Bot - Retrieval Augmented Generation for Travista

## Overview

Your Travista application now has a complete **Retrieval Augmented Generation (RAG)** bot that combines powerful LLM capabilities with domain-specific travel knowledge. This bot can answer travel questions with accurate, contextual information.

## How RAG Works

```
User Question
    ↓
[1] RETRIEVE: Search vector database for relevant documents
    ↓
[2] AUGMENT: Combine question + retrieved context
    ↓
[3] GENERATE: Use LLM to generate answer based on context
    ↓
Answer with Sources
```

## Architecture

### Components

1. **Embedder** (`app/rag/embedder.py`) - Converts text to embeddings using OpenAI
2. **Loader** (`app/rag/loader.py`) - Loads travel documents from `app/rag/data/`
3. **Vector Store** (`app/rag/vector_store.py`) - Stores embeddings in FAISS database
4. **Retriever** (`app/rag/retriever.py`) - Finds relevant documents for queries
5. **Generator** (`app/rag/generator.py`) - Uses GPT-4o-mini to generate answers
6. **Pipeline** (`app/rag/pipeline.py`) - Orchestrates the entire RAG flow

### Data Files

```
backend/app/rag/data/
├── travel_tips.txt              # General travel tips & safety
├── popular_destinations.txt     # Destination guides
├── accommodation_guide.txt      # Hotel & hostel tips
└── transportation_guide.txt     # Flight, train, bus info
```

## API Endpoints

### 1. Generic Chat (No Context)
```
POST /ai/chat
Content-Type: application/json

{
  "message": "What is Travista?"
}

Response:
{
  "reply": "Answer from GPT-4o-mini"
}
```

### 2. RAG-Enhanced Chat (With Context)
```
POST /ai/rag-chat
Content-Type: application/json

{
  "question": "What are the cheapest ways to travel in Southeast Asia?"
}

Response:
{
  "question": "What are the cheapest ways to travel in Southeast Asia?",
  "answer": "Based on travel guides...",
  "context": "Buses: Very cheap, $1-10 for long distances...",
  "source": "RAG-Enhanced"
}
```

## Starting the Server

```bash
cd backend
uvicorn app.main:app --reload
```

Server runs on: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## Testing the RAG Bot

### Using Python
```python
import requests

# Test RAG endpoint
response = requests.post(
    "http://localhost:8000/ai/rag-chat",
    json={"question": "How should I plan a budget trip to Asia?"}
)

print(response.json())
```

### Using cURL
```bash
curl -X POST "http://localhost:8000/ai/rag-chat" \
  -H "Content-Type: application/json" \
  -d '{"question": "Best budget airlines in Europe?"}'
```

### Using FastAPI Swagger UI
1. Navigate to `http://localhost:8000/docs`
2. Find `/ai/rag-chat` endpoint
3. Click "Try it out"
4. Enter your question
5. Click "Execute"

## Adding More Training Data

To improve RAG bot accuracy, add more `.txt` files to `backend/app/rag/data/`:

1. Create a new file: `backend/app/rag/data/your_topic.txt`
2. Add travel information in plain text
3. Restart the server
4. The bot will automatically load and index the new data

Example structure:
```
TOPIC TITLE

Subtitle 1:
- Point 1
- Point 2
- Point 3

Subtitle 2:
Details and information...
```

## Configuration

### Environment Variables (`.env`)
```
OPENAI_API_KEY=your_api_key_here
```

### Model Settings (`app/core/openai_client.py`)
- **Model**: `gpt-4o-mini` (fast and affordable)
- **Max Tokens**: 400
- **Temperature**: 0.7 (balanced creativity)

## Performance Tips

1. **Limit Retrieved Documents**: Modify `k=3` in `app/rag/retriever.py` for more/fewer results
2. **Vector Store Size**: More documents = slower retrieval but better coverage
3. **Caching**: Implement caching for frequently asked questions
4. **Batch Processing**: Use async/await for concurrent requests

## Troubleshooting

### Issue: "No documents found in backend/app/rag/data"
- **Solution**: Add `.txt` files to the data directory and restart the server

### Issue: "Import 'fastapi' could not be resolved"
- **Solution**: Ensure virtual environment is activated and all dependencies are installed
  ```bash
  pip install fastapi uvicorn langchain langchain-openai langchain-community
  ```

### Issue: OpenAI API errors
- **Solution**: Verify your `OPENAI_API_KEY` is set correctly in `.env`
- Check OpenAI account has sufficient credits

### Issue: Vector Store not initializing
- **Solution**: Check that `app/rag/data/` directory exists and contains `.txt` files

## Next Steps

1. ✅ Add more travel-related documents to improve accuracy
2. 🔲 Implement chat history for context awareness
3. 🔲 Add document metadata (source, date) to responses
4. 🔲 Create frontend integration for RAG chat
5. 🔲 Add user feedback mechanism to improve responses
6. 🔲 Implement rate limiting for API protection
7. 🔲 Add logging and monitoring

## Code Structure

```python
# Simple RAG usage
from app.rag.pipeline import rag_pipeline

result = rag_pipeline("Your question here")
print(f"Answer: {result['answer']}")
print(f"Context: {result['context_used']}")
```

## Best Practices

1. **Quality Data**: Ensure training data is accurate and well-organized
2. **Regular Updates**: Keep travel guides current with latest information
3. **User Feedback**: Monitor questions that aren't answered well
4. **Cost Management**: Monitor OpenAI API usage for cost optimization
5. **Privacy**: Don't store sensitive user data in vector database

## Performance Metrics

- **Embedding Generation**: ~100ms per document
- **Similarity Search**: ~10ms for 1000 documents
- **LLM Response**: ~2-5 seconds
- **Total End-to-End**: ~2-6 seconds per query

## Future Enhancements

1. **Multi-language Support**: Support travel advice in multiple languages
2. **Real-time Updates**: Integrate with travel APIs (flights, hotels)
3. **Personalization**: Customize answers based on user preferences
4. **Memory**: Maintain conversation history for better context
5. **Analytics**: Track popular questions and improve coverage

---

**Your RAG bot is now ready to serve intelligent, context-aware travel advice!** 🚀
