from typing import Union
from fastapi import FastAPI, File, UploadFile
import chromadb
from utils.transcribe_offline_function import transcribe_file_offline
import datetime

app = FastAPI()

# resolve cors error from frontend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.post("/get_transcribe/")
async def get_transcribe(file: UploadFile = File(...)):
    # Check if file was uploaded
    if not file:
        return {"error": "No file uploaded"}
    
    # Check if file is a wav file
    if not file.filename.endswith('.wav'):
        return {"error": "Only .wav files are supported"}
    
    try:
        # Read the file content
        file_content = await file.read()
        
        # Save the file to audio_samples folder with date and time as name
        now = datetime.datetime.now()
        date_time = now.strftime("%Y-%m-%d_%H-%M-%S")
        file_path = f"/app/audio_samples/temp{date_time}.wav"
        
        with open(file_path, "wb") as f:
            f.write(file_content)

        response = transcribe_file_offline(
            input_file=file_path,
            server="grpc.nvcf.nvidia.com:443",
            use_ssl=True,
            metadata=[
                ["function-id", "d3fe9151-442b-4204-a70d-5fcc597fd610"],
                ["authorization", "Bearer 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"]
            ],
            language_code="en-US",
            word_time_offsets=True,
            automatic_punctuation=True
        )

        # Access results programmatically
        if response and len(response.results) > 0:
            transcript = response.results[0].alternatives[0].transcript
            print(f"Transcript: {transcript}")
            return {"transcript": transcript}
        else:
            return {"error": "No transcription results"}
            
    except Exception as e:
        print(f"Error processing file: {e}")
        return {"error": f"Error processing file: {str(e)}"}