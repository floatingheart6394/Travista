import os
from langchain_openai import OpenAIEmbeddings

def get_embedder():
    api_key = os.getenv("OPENAI_API_KEY")
    return OpenAIEmbeddings(api_key=api_key)

