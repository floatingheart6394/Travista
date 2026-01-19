# RAG Bot Visual Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Travista Frontend (React)                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  User Types Question: "Budget travel tips?"            │   │
│  └──────────────────┬─────────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────────┘
                      │
                      ↓
         ┌────────────────────────────┐
         │  POST /ai/rag-chat         │
         │  {"question": "..."}       │
         └────────────┬───────────────┘
                      │
        ┌─────────────▼──────────────────┐
        │                                │
        │     FastAPI Backend            │
        │  (app/routes/ai_assistant.py)  │
        │                                │
        │  1. Parse request             │
        │  2. Call rag_pipeline()       │
        │  3. Return response           │
        │                                │
        └─────────────┬──────────────────┘
                      │
        ┌─────────────▼──────────────────────────────┐
        │                                            │
        │        RAG Pipeline                       │
        │    (app/rag/pipeline.py)                 │
        │                                            │
        │  ┌──────────────────────────────────┐   │
        │  │  1. RETRIEVE CONTEXT             │   │
        │  │  retrieve_context(question)      │   │
        │  └──────────────────┬───────────────┘   │
        │                     │                    │
        │  ┌──────────────────▼───────────────┐   │
        │  │  2. GENERATE ANSWER              │   │
        │  │  generate_answer(question, ctx)  │   │
        │  └──────────────────┬───────────────┘   │
        │                     │                    │
        │  ┌──────────────────▼───────────────┐   │
        │  │  3. RETURN RESULT                │   │
        │  │  {answer, context, sources}      │   │
        │  └──────────────────┬───────────────┘   │
        │                     │                    │
        └─────────────────────┼────────────────────┘
                              │
        ┌─────────────────────▼──────────────────┐
        │                                        │
        │    Response with Context               │
        │  {                                     │
        │    "question": "...",                  │
        │    "answer": "Based on travel...",    │
        │    "context": "Document excerpt",     │
        │    "source": "RAG-Enhanced"           │
        │  }                                     │
        │                                        │
        └─────────────────────┬──────────────────┘
                              │
        ┌─────────────────────▼──────────────────┐
        │     Display in Frontend                 │
        │                                        │
        │  ✓ Answer to user                      │
        │  ✓ Source documents                    │
        │  ✓ Confidence indication               │
        └────────────────────────────────────────┘
```

## Data Flow Detail: RETRIEVE Component

```
                    User Question
                         │
                         ▼
        ┌─────────────────────────────────┐
        │  Question Embedding             │
        │  (OpenAI Embeddings API)        │
        │                                 │
        │  Input:  "Budget travel tips?" │
        │  Output: [0.1, 0.5, ..., 0.8]  │
        │  (1536-dimensional vector)      │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼─────────────────┐
        │  Vector Similarity Search        │
        │  (FAISS Database)                │
        │                                  │
        │  Compare with all documents:    │
        │  - travel_tips.txt              │
        │  - popular_destinations.txt     │
        │  - accommodation_guide.txt      │
        │  - transportation_guide.txt     │
        │                                  │
        │  Return: Top-3 similar docs     │
        └────────────────┬─────────────────┘
                         │
        ┌────────────────▼──────────────────┐
        │  Retrieved Context                │
        │                                   │
        │  "Budget Travel Tips:            │
        │  1. Book flights 6-8 weeks in... │
        │  2. Use price comparison sites  │
        │  3. Avoid peak seasons...        │
        │  ..."                            │
        │                                   │
        └────────────────┬──────────────────┘
                         │
                         ▼
                   (Used in GENERATE)
```

## Data Flow Detail: GENERATE Component

```
        Question + Context
              │
              ▼
    ┌─────────────────────────────┐
    │  Build Prompt               │
    │                             │
    │  System: "You are Tavi,    │
    │   intelligent travel bot"   │
    │                             │
    │  Context:                   │
    │  "Budget Travel Tips: ..."  │
    │                             │
    │  Question:                  │
    │  "Budget travel tips?"      │
    │                             │
    │  Instruction:               │
    │  "Answer using context"     │
    └────────────┬────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────┐
    │  Call OpenAI API                │
    │  (GPT-4o-mini)                  │
    │                                 │
    │  Model: gpt-4o-mini            │
    │  Tokens: up to 400             │
    │  Temperature: 0.7              │
    └────────────┬────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │  Generated Response            │
    │                               │
    │  "Based on travel guides,    │
    │  here are budget tips:        │
    │  1. Book in advance...        │
    │  2. Use budget airlines...    │
    │  3. Travel off-season..."     │
    │                               │
    └────────────┬─────────────────┘
                 │
                 ▼
           Response Ready
```

## Document Processing Pipeline

```
Startup Event
    │
    ▼
┌─────────────────────────────────────────┐
│  Load Documents                         │
│  (app/rag/loader.py)                   │
│                                         │
│  Files in backend/app/rag/data/:       │
│  ✓ travel_tips.txt                     │
│  ✓ popular_destinations.txt            │
│  ✓ accommodation_guide.txt             │
│  ✓ transportation_guide.txt            │
│                                         │
│  Output: 4 documents, ~10KB total      │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  Initialize Embedder                 │
│  (app/rag/embedder.py)              │
│                                      │
│  Provider: OpenAI                   │
│  Model: text-embedding-3-small      │
│  Dimension: 1536                    │
│  Cost: ~$0.0001 per document        │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  Create Embeddings                   │
│  (For each document):                │
│                                      │
│  travel_tips.txt                    │
│    → [0.12, 0.45, ..., 0.67]       │
│                                      │
│  popular_destinations.txt            │
│    → [0.23, 0.56, ..., 0.78]       │
│                                      │
│  accommodation_guide.txt             │
│    → [0.34, 0.67, ..., 0.89]       │
│                                      │
│  transportation_guide.txt            │
│    → [0.45, 0.78, ..., 0.90]       │
│                                      │
│  Cost: ~$0.0004 total               │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  Build Vector Store (FAISS)          │
│                                      │
│  In-Memory Database:                 │
│  ┌────────────────────────────────┐ │
│  │ Document 1: [embedding vector] │ │
│  │ Document 2: [embedding vector] │ │
│  │ Document 3: [embedding vector] │ │
│  │ Document 4: [embedding vector] │ │
│  └────────────────────────────────┘ │
│                                      │
│  Ready for similarity search         │
│                                      │
│  Search Speed: ~10ms per query      │
└────────────┬────────────────────────┘
             │
             ▼
    Vector Store Ready!
        (Cached in RAM)
```

## Request-Response Timing

```
Time  Component              Action              Duration
────  ─────────────────────  ─────────────────  ──────────
t=0   Frontend              Send request         -
      └─────────────────────────────────────→ 50ms

t=50  FastAPI              Receive & parse      10ms
      └─────────────────────────────────────→ 10ms

t=60  RAG Pipeline         Start                -

      ├─ Embedder          Embed question       100ms
      │  └────────────────────────────────→ 100ms

t=160 ├─ Retriever         Search FAISS         20ms
      │  └────────────────────────────────→ 20ms

t=180 └─ Generator          Call OpenAI API     2000ms
         └────────────────────────────────→ 2000ms

t=2180 FastAPI              Format response     10ms
       └─────────────────────────────────→ 10ms

t=2190 Frontend             Display answer      30ms
       ←─────────────────────────────────

────────────────────────────────────────
TOTAL:  ~2.2 seconds (average)
────────────────────────────────────────
```

## Cost Breakdown Per Request

```
Component              API Call        Cost per Request
──────────────────────────────────────────────────────
Question Embedding     OpenAI Embed    $0.00002
(1x question)

Document Search        FAISS (Free)    $0.00000
(4x documents)

LLM Generation         GPT-4o-mini    $0.00150
(~100-200 output tokens)

Total Per Request                      ~$0.00152
────────────────────────────────────────────────────────
1000 Requests/Month                    ~$1.50
10000 Requests/Month                   ~$15.00
```

## Technology Stack Visualization

```
┌──────────────────────────────────────────────────────┐
│                Frontend Layer                        │
│           React.js (Vite Build System)              │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  AI Chat Component                         │    │
│  │  - Input: User question                   │    │
│  │  - Output: RAG-enhanced answer            │    │
│  └────────────────────────────────────────────┘    │
└────────────────────┬─────────────────────────────────┘
                     │ REST API
                     │ (HTTP/JSON)
                     ▼
┌────────────────────────────────────────────────────┐
│             FastAPI Backend                        │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  Routes (ai_assistant.py)                   │ │
│  │  ┌────────────────────────────────────────┐ │ │
│  │  │ POST /ai/rag-chat                      │ │ │
│  │  └────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────┘ │
│                     │                             │
│  ┌──────────────────▼──────────────────────────┐ │
│  │  RAG Pipeline (pipeline.py)                 │ │
│  │  ├─ Retriever (retriever.py)               │ │
│  │  ├─ Generator (generator.py)               │ │
│  │  └─ Vector Store (vector_store.py)         │ │
│  └──────────────────────────────────────────────┘ │
│                     │                             │
│  ┌──────────────────▼──────────────────────────┐ │
│  │  Vector Database (FAISS)                    │ │
│  │  ├─ travel_tips embedding                  │ │
│  │  ├─ destinations embedding                 │ │
│  │  ├─ accommodation embedding                │ │
│  │  └─ transportation embedding               │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────┬─────────────────────────────┘
                     │ API Calls
                     │ (HTTPS)
                     ▼
┌─────────────────────────────────────────────────┐
│         External Services                       │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  OpenAI API                              │  │
│  │  ├─ Embeddings (text-embedding-3)       │  │
│  │  └─ Chat Completions (gpt-4o-mini)      │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  PostgreSQL Database                     │  │
│  │  (User data, trips, todos, etc)         │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Document Embedding Space Visualization

```
3D Embedding Space (Simplified to 2D)

                    [0, 1]
                      │
    Travel Safety     │        [1, 1]
    Tips              │      ╱
      ●               │    ╱
       │\             │  ╱
       │ \  Similar   │╱
       │  \─────────╳ ┼─────── Budget Travel
       │           ╱ │       ●
       │         ╱   │      ╱
       │       ╱     │    ╱
       │     ╱       │  ╱  [0.5, 0.5]
       │   ╱         │╱
       │ ╱           ├──────────── Accommodation
       │             │             ●
       │             │
       │             │
    [0, 0] ─────────┼─────────── [1, 0]
                    0

Query: "Budget travel"
   ↓
Embedding: [0.45, 0.55]
   ↓
Finds closest documents:
  1. travel_tips.txt (0.92 similarity)
  2. accommodation_guide.txt (0.87 similarity)
  3. transportation_guide.txt (0.85 similarity)
```

---

**This visual guide helps understand how your RAG bot processes questions and retrieves knowledge!**
