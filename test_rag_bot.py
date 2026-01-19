#!/usr/bin/env python3
"""
Test script for Travista RAG Bot
Run this to verify RAG functionality before deploying
"""

import asyncio
from pathlib import Path
import sys
import os

# Add backend to path
backend_path = str(Path(__file__).parent / "backend")
sys.path.insert(0, backend_path)
os.chdir(Path(__file__).parent)

async def test_rag_system():
    """Test the complete RAG system"""
    
    print("=" * 60)
    print("TRAVISTA RAG BOT - System Test")
    print("=" * 60)
    
    # Test 1: Check data files exist
    print("\n[1] Checking data files...")
    data_dir = Path("backend/app/rag/data")
    txt_files = list(data_dir.glob("*.txt"))
    
    if not txt_files:
        print("❌ No .txt files found in backend/app/rag/data")
        return False
    
    print(f"✓ Found {len(txt_files)} document(s):")
    for file in txt_files:
        size = file.stat().st_size
        print(f"  - {file.name} ({size:,} bytes)")
    
    # Test 2: Import modules
    print("\n[2] Testing imports...")
    try:
        # Change to backend directory for imports
        import os
        os.chdir(Path(__file__).parent / "backend")
        sys.path.insert(0, str(Path(__file__).parent / "backend"))
        
        from app.rag.pipeline import rag_pipeline, initialize_rag  # type: ignore
        from app.rag.loader import load_documents  # type: ignore
        from app.rag.embedder import get_embedder  # type: ignore
        print("✓ All RAG modules imported successfully")
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    
    # Test 3: Load documents
    print("\n[3] Loading documents...")
    try:
        documents = load_documents("backend/app/rag/data")
        print(f"✓ Loaded {len(documents)} document(s)")
        if documents:
            print(f"  - First document preview: {documents[0][:100]}...")
    except Exception as e:
        print(f"❌ Error loading documents: {e}")
        return False
    
    # Test 4: Initialize vector store
    print("\n[4] Initializing vector store...")
    try:
        initialize_rag("backend/app/rag/data")
        print("✓ Vector store initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing vector store: {e}")
        return False
    
    # Test 5: Test RAG pipeline
    print("\n[5] Testing RAG pipeline...")
    test_questions = [
        "What are budget travel tips?",
        "Best cheap transportation in Asia?",
        "How do I find affordable accommodation?"
    ]
    
    try:
        for question in test_questions:
            print(f"\n  Q: {question}")
            result = rag_pipeline(question)
            answer = result['answer'][:150] + "..." if len(result['answer']) > 150 else result['answer']
            print(f"  A: {answer}")
    except Exception as e:
        print(f"❌ Error in RAG pipeline: {e}")
        return False
    
    # Test 6: Verify endpoints
    print("\n[6] RAG Endpoints available:")
    print("  POST /ai/chat - Generic chat without context")
    print("  POST /ai/rag-chat - Context-aware RAG chat")
    
    print("\n" + "=" * 60)
    print("✓ RAG Bot System Test Passed!")
    print("=" * 60)
    print("\nYou can now start the server:")
    print("  cd backend")
    print("  uvicorn app.main:app --reload")
    print("\nThen test the endpoints at:")
    print("  http://localhost:8000/docs")
    
    return True

if __name__ == "__main__":
    try:
        success = asyncio.run(test_rag_system())
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
