# 🚀 Getting Started in 5 Minutes

## ⏱️ Quick Setup (5 minutes)

### Step 1: Verify Installation (1 min)
```bash
# Check Python version
python --version
# Should be 3.10+

# Check virtual environment
source .venv/Scripts/activate  # Windows
# or
source .venv/bin/activate      # macOS/Linux
```

### Step 2: Set Environment Variables (1 min)
```bash
# Create .env file if not exists
touch .env

# Add your OpenAI API key
echo OPENAI_API_KEY=sk-... >> .env

# Verify it's set
cat .env
```

### Step 3: Start the Server (1 min)
```bash
cd backend
uvicorn app.main:app --reload
```

**You should see:**
```
✓ RAG system initialized successfully
✓ Uvicorn running on http://127.0.0.1:8000
```

### Step 4: Test the Bot (1 min)
Open browser: **http://localhost:8000/docs**

Find `/ai/rag-chat` → Click "Try it out"

```json
{
  "question": "What are budget travel tips?"
}
```

Click Execute → See the response! 🎉

### Step 5: Run Full Test (1 min)
```bash
python test_rag_bot.py
```

**All tests should pass!** ✅

---

## 📚 What Just Happened?

Your RAG bot:
1. ✅ Loaded 4 travel guide documents
2. ✅ Created embeddings for each document
3. ✅ Built vector database for searching
4. ✅ Started API server
5. ✅ Ready to answer travel questions!

---

## 🎯 Next: Common Tasks

### Task 1: Ask a Question
```bash
curl -X POST http://localhost:8000/ai/rag-chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Cheapest airlines in Europe?"}'
```

### Task 2: Add Training Data
1. Create file: `backend/app/rag/data/new_topic.txt`
2. Add travel information
3. Restart server
4. Done! 🎉

### Task 3: Integrate with Frontend
In your React component:
```javascript
const response = await fetch('http://localhost:8000/ai/rag-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: userQuestion })
});

const data = await response.json();
console.log(data.answer);
```

### Task 4: Monitor Costs
Each request costs ~$0.002-0.005 using gpt-4o-mini
1000 requests = ~$2

---

## ❌ Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| **"Module not found"** | `pip install -r requirements.txt` |
| **"No documents"** | Check `backend/app/rag/data/` has 4 .txt files |
| **"API key error"** | Set `OPENAI_API_KEY` in .env |
| **"Connection refused"** | Make sure server is running |
| **"Slow response"** | Normal - LLM takes 2-5 seconds |

---

## 📖 Documentation Files

### Read in This Order:
1. **This file** (you're here!) - 5 min read
2. [START_HERE.md](START_HERE.md) - 10 min read
3. [RAG_QUICK_REFERENCE.md](RAG_QUICK_REFERENCE.md) - 5 min read
4. [RAG_BOT_GUIDE.md](RAG_BOT_GUIDE.md) - Full reference

### For Specific Needs:
- **Architecture?** → [RAG_VISUAL_GUIDE.md](RAG_VISUAL_GUIDE.md)
- **API Examples?** → [RAG_API_EXAMPLES.json](RAG_API_EXAMPLES.json)
- **Deploying?** → [RAG_IMPLEMENTATION_CHECKLIST.md](RAG_IMPLEMENTATION_CHECKLIST.md)

---

## ✅ Success Checklist

After 5 minutes, you should have:

- [x] Server running on http://localhost:8000
- [x] Swagger UI accessible at http://localhost:8000/docs
- [x] Test script passed: `python test_rag_bot.py`
- [x] 4 training documents loaded
- [x] Vector database initialized
- [x] `/ai/rag-chat` endpoint working
- [x] Sample response received from bot

---

## 🎓 Understanding the Flow

### User asks: "Budget travel tips?"
```
1. Question goes to /ai/rag-chat endpoint
   ↓
2. RAG pipeline starts
   ↓
3. Question converted to embedding
   ↓
4. Similarity search finds relevant docs
   ↓
5. Context + Question sent to GPT-4o-mini
   ↓
6. LLM generates answer using context
   ↓
7. Response sent back with sources
   ↓
8. Frontend displays to user
```

**Total time: 2-6 seconds**

---

## 💡 Pro Tips

### Tip 1: Use Better Questions
✅ Good: "What are budget airlines in Europe?"
❌ Bad: "Airlines?"

### Tip 2: Check Server Logs
Run server without `--reload` to see all logs:
```bash
cd backend
uvicorn app.main:app
```

### Tip 3: Test in Swagger First
Always test endpoints at:
```
http://localhost:8000/docs
```
Before integrating with frontend.

### Tip 4: Monitor Costs
Each request uses OpenAI API:
- Embeddings: ~$0.0001
- LLM generation: ~$0.002
- **Total: ~$0.002-0.005**

### Tip 5: Cache Frequent Questions
If users ask the same thing, cache the response to save costs.

---

## 🚀 You're Ready!

### To Deploy to Production:
1. Follow [RAG_IMPLEMENTATION_CHECKLIST.md](RAG_IMPLEMENTATION_CHECKLIST.md)
2. Set environment variables
3. Deploy to your hosting
4. Monitor costs and responses

### To Extend Knowledge:
1. Add `.txt` files to `backend/app/rag/data/`
2. Restart server
3. Test with new questions

### To Integrate Frontend:
1. Point requests to your API
2. Display the `answer` field
3. (Optional) Show the `context` field

---

## 📞 Need Help?

### Self-Help (First Try These)
1. Run test script: `python test_rag_bot.py`
2. Check [RAG_BOT_GUIDE.md](RAG_BOT_GUIDE.md#troubleshooting)
3. Review [RAG_API_EXAMPLES.json](RAG_API_EXAMPLES.json)

### Common Questions
**Q: How do I add more training data?**
A: Create `.txt` files in `backend/app/rag/data/`

**Q: How much does it cost?**
A: ~$2-5 per 1000 requests (using gpt-4o-mini)

**Q: Why is it slow?**
A: LLM responses take 2-5 seconds. This is normal.

**Q: How do I integrate with React?**
A: See code example in "Task 3" above.

---

## 🎉 Summary

You now have:
- ✅ Working RAG bot
- ✅ 4 training documents
- ✅ 2 API endpoints
- ✅ Complete documentation
- ✅ Test suite
- ✅ Ready for production

**Start answering travel questions!** ✈️

---

### Next Steps:
1. Test it out at http://localhost:8000/docs
2. Read [START_HERE.md](START_HERE.md)
3. Deploy to production
4. Integrate with frontend
5. Start using it!

**Happy travels!** 🌍
