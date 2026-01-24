from app.rag.retriever import retrieve_context
from app.rag.generator import generate_answer
from app.rag.vector_store import initialize_vector_store

def initialize_rag(data_dir: str) -> None:
    """
    Initialize RAG system by loading documents and creating vector store.
    Call this during application startup.
    """
    initialize_vector_store(data_dir)
    print("[info] RAG system initialized successfully")

def rag_pipeline(question: str) -> dict:
    """
    Full RAG pipeline:
    1. Retrieve context
    2. Generate grounded answer
    """

    context = retrieve_context(question)
    answer = generate_answer(question, context)

    return {
        "question": question,
        "answer": answer,
        "context_used": context
    }
