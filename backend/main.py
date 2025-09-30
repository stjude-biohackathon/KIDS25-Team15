from typing import Union
from fastapi import FastAPI
import chromadb

app = FastAPI()


@app.get("/")
async def read_root():
    return {"Hello": "World"}

# post endpoint with /get_context/ which will have question from forntend
@app.post("/get_context/")
async def get_context(request: dict):
    question = request.get("question")
    chroma_client = chromadb.PersistentClient(path="/app/chroma/.")
    collection = chroma_client.get_collection(name="jude-e-documents")
    # get top 5 chunks from collection based on question
    top_5_chunks = collection.query(query_texts=[question], n_results=5)
    documents = top_5_chunks['documents']
    distances = top_5_chunks['distances']
    # for now just return the question
    return {"question": question, "documents": documents, "distances": distances}