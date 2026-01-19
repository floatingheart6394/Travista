from langchain_community.vectorstores import FAISS
try:
    from langchain_core.documents import Document  # type: ignore
except ImportError:
    try:
        from langchain.schema import Document  # type: ignore
    except ImportError:
        from langchain_core.schema import Document  # type: ignore
from app.rag.embedder import get_embedder
from app.rag.loader import load_documents
from pathlib import Path

_vector_store = None

def initialize_vector_store(data_dir: str = "backend/app/rag/data") -> None:
    """Initialize the vector store with documents from the specified directory."""
    global _vector_store
    
    # Create data directory if it doesn't exist
    Path(data_dir).mkdir(parents=True, exist_ok=True)
    
    documents = load_documents(data_dir)
    if not documents:
        print(f"⚠ Warning: No documents found in {data_dir}")
        # Create a dummy vector store with default content
        documents = ["Travista is a travel planning application"]
    
    embedder = get_embedder()
    
    # Convert strings to Document objects if needed
    doc_objects = [
        Document(page_content=doc) if isinstance(doc, str) else doc 
        for doc in documents
    ]
    
    _vector_store = FAISS.from_documents(
        documents=doc_objects,
        embedding=embedder
    )
    print(f"✓ Vector store initialized with {len(doc_objects)} documents")

def get_vector_store():
    global _vector_store

    if _vector_store is None:
        initialize_vector_store()

    return _vector_store
