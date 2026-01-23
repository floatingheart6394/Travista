from pathlib import Path
from typing import List

def load_documents(data_dir: str = "backend/app/rag/data") -> List[str]:
    """
    Loads all .txt files from the specified data directory
    and returns them as a list of strings.
    """
    documents = []
    data_path = Path(data_dir)

    if not data_path.exists():
        print(f"[warn] Creating directory: {data_dir}")
        data_path.mkdir(parents=True, exist_ok=True)
        return documents

    txt_files = list(data_path.glob("*.txt"))
    print(f"[info] Found {len(txt_files)} document(s) in {data_dir}")

    for file in txt_files:
        try:
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()
                documents.append(content)
                print(f"  [info] Loaded: {file.name}")
        except Exception as e:
            print(f"  [error] Error loading {file.name}: {e}")

    return documents
