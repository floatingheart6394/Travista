from app.rag.vector_store import get_vector_store

def retrieve_context(question: str, k: int = 3) -> str:
    """
    Retrieves top-k relevant documents for a question.
    """
    vector_store = get_vector_store()
    results = vector_store.similarity_search(question, k=k)

    context = "\n\n".join(
        [doc.page_content for doc in results]
    )

    return context
