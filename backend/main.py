from typing import Union
from fastapi import FastAPI, File, UploadFile
import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
from langchain.vectorstores.base import VectorStoreRetriever
# from langchain.embeddings.base import Embeddings
from utils.transcribe_offline_function import transcribe_file_offline
import datetime
from typing import List, Tuple, Dict, Any, Optional
import re
from sklearn.metrics.pairwise import cosine_similarity

from fastapi import Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from utils.tts import synthesize_text_to_wav, OUTPUT_DIR
# resolve cors error from frontend
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.mount("/audiofiles", StaticFiles(directory=OUTPUT_DIR), name="audiofiles")

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

@app.post("/tts")
async def synthesize(
    text: str = Form(...),
    text_id: Union[str, None] = Form(None)
):
    try:
        result = synthesize_text_to_wav(
            text=text,
            server="grpc.nvcf.nvidia.com:443",
            voice="Magpie-Multilingual.EN-US.Mia",
            language_code="en-US",
            sample_rate_hz=44100,
            encoding="LINEAR_PCM",
             metadata=[
                ["function-id", "877104f7-e885-42b9-8de8-f6e4c6303969"],
                ["authorization", "Bearer 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"]
            ],
            use_ssl=True,
        )

        # Build public URL (relative)
        # file_url = f"/files/{Path(file_path).name}"

        # return {
        #     "text": text,
        #     "file_url": file_url,
        #     "time_spent": time_spent
        # }
        # Convert result to dict if possible
        import json

        def make_serializable(obj):
            try:
                json.dumps(obj)
                return obj
            except TypeError:
                if hasattr(obj, "__dict__"):
                    return {k: make_serializable(v) for k, v in obj.__dict__.items()}
                return str(obj)

        # if hasattr(result, "to_dict"):
        #     result_dict = make_serializable(result.to_dict())
        # elif hasattr(result, "__dict__"):
        #     result_dict = make_serializable(result.__dict__)
        # else:
        #     result_dict = str(result)
        return JSONResponse(content={"audio_path": result[0], "audio_id": text_id}, status_code=200)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
    # return {"message": "This is text to audio endpoint"}

# post endpoint with /get_context/ which will have question from forntend
@app.post("/get_context/")
async def get_context(request: dict):
    question = request.get("question")
    expanded_queries = expand_query(question)
    metadata_filter = detect_metadata_filter(question)
    query_prefix: str = "query: "
    chroma_client = chromadb.PersistentClient(path="/app/chroma/.")
    collection = chroma_client.get_collection(name="jude-e-documents")
    # db_retriever: VectorStoreRetriever = chromadb.PersistentClient(path="/app/chroma/.").get_collection(name="jude-e-documents").as_retriever()
    # embedder = chromadb.utils.embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    embedder = DefaultEmbeddingFunction()
    k_docs: int = 10  # Increased from 5
    # lambda_mult: float = 0.3  # Lower for more similarity focus
    query_prefix: str = "query: ",
    doc_prefix: str = "passage: "

     # Step 3: Retrieve documents for each expanded query with metadata filter
    all_retrieved_docs = []

    for exp_query in expanded_queries:
        formatted_query = f"{query_prefix}{exp_query}"

        # # Define retriever method
        # retriever = db_retriever.query()

        # Get relevant documents
        results = collection.query(
            query_texts=[formatted_query],
            n_results=k_docs,
            where=metadata_filter
        )['documents'][0]

        # Store documents with their expanded query context
        for doc in results:
            all_retrieved_docs.append((doc, exp_query))

    # Step 3: Remove duplicates while preserving order
    seen_docs = set()
    unique_docs = []
    for doc_content, exp_query in all_retrieved_docs:
        if doc_content not in seen_docs:
            seen_docs.add(doc_content)
            unique_docs.append((doc_content, exp_query))

    # Step 4: Re-rank all unique documents against original query
    original_formatted_query = f"{query_prefix}{question}"
    # query_embed = embedder.embed_query(original_formatted_query)
    query_embed = embedder([original_formatted_query])[0]

    # Format documents for embedding
    formatted_retrieved_docs = [f"{doc_prefix}{doc}" for doc, _ in unique_docs]

    # Embed documents
    # doc_embeds = embedder.embed_documents(formatted_retrieved_docs)
    doc_embeds = [embedder([doc])[0] for doc in formatted_retrieved_docs]

    # Compute similarity scores
    similarity_scores = cosine_similarity([query_embed], doc_embeds)[0]

    # Step 5: Combine documents with scores and rank
    ranked_docs = []
    for i, (formatted_doc, score) in enumerate(zip(formatted_retrieved_docs, similarity_scores)):
        original_doc, exp_query = unique_docs[i]
        ranked_docs.append((formatted_doc, score, exp_query))

    # Sort by similarity score (descending)
    ranked_docs.sort(key=lambda x: x[1], reverse=True)

    # # Step 6: Apply keyword boost for exact matches
    boosted_docs = []
    query_keywords = set(re.findall(r'\b\w+\b', question.lower()))

    for doc, score, exp_query in ranked_docs:
        doc_keywords = set(re.findall(r'\b\w+\b', doc.lower()))
        keyword_overlap = len(query_keywords.intersection(doc_keywords))

        # Boost score based on keyword overlap
        boosted_score = score + (keyword_overlap * 0.05)  # Small boost for keyword matches
        boosted_docs.append((doc, boosted_score, exp_query))

    # # Final sort by boosted scores
    boosted_docs.sort(key=lambda x: x[1], reverse=True)

    # Display results
    print("Query:", question)
    print(f"\nExpanded to {len(expanded_queries)} queries")
    print(f"Retrieved {len(unique_docs)} unique documents")
    print(f"\nTop {k_docs} Retrieved Chunks with Scores:\n")

    final_docs = []
    final_scores = []
    for i, (doc, score, exp_query) in enumerate(boosted_docs[:k_docs]):
        print(f"Chunk {i+1} (Score: {score:.4f}, From: '{exp_query}'):")
        print(f"{doc}")
        print(f"{'-'*80}")
        final_docs.append(doc)
        final_scores.append(float(score))  # Convert numpy.float32 to Python float

    return {"question": question, "documents": final_docs, "distances": final_scores}

    # chroma_client = chromadb.PersistentClient(path="/app/chroma/.")
    # collection = chroma_client.get_collection(name="jude-e-documents")
    # # get top 5 chunks from collection based on question
    # top_5_chunks = collection.query(query_texts=[question], n_results=5)
    # documents = top_5_chunks['documents']
    # distances = top_5_chunks['distances']
    # # for now just return the question
    # return {"question": question, "documents": documents, "distances": distances}


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
    
def expand_query(query: str) -> List[str]:
    """Expand query with related terms for better retrieval"""
    expansions = {
        # Medical terms
        "symptoms": ["signs", "indications", "early signs", "clinical features"],
        "treatment": ["therapy", "management", "care", "intervention"],
        "side effects": ["adverse effects", "toxicities", "complications"],
        "diagnosis": ["testing", "screening", "evaluation"],
        "prognosis": ["outlook", "survival", "recovery chances"],
        "clinical trial": ["research study", "trial", "experimental therapy"],
        # Cancer / disease
        "cancer": ["tumor", "carcinoma", "malignancy", "oncology"],
        "leukemia": ["blood cancer", "ALL", "AML"],
        "lymphoma": ["hodgkin", "non-hodgkin"],
        "infection": ["illness", "disease", "condition", "virus", "bacteria"],
        # Resources
        "meal": ["food", "nutrition", "dining", "cafeteria", "diet"],
        "housing": ["lodging", "accommodation", "place to stay", "family housing"],
        "transportation": ["shuttle", "travel", "ride", "commute", "bus service"],
        "financial": ["cost", "expenses", "billing", "assistance", "funding"],
        "support": ["counseling", "resources", "services", "help", "aid"],
        "eat": ["restaurants", "menu"],
        # Hospital / logistics
        "admission": ["application", "check-in", "eligibility", "requirements"],
        "visitor": ["guest", "family member", "parent", "guardian"],
        "appointment": ["clinic visit", "consultation", "checkup", "follow-up"],
    }

    expanded_queries = [query]
    query_lower = query.lower()

    for key, synonyms in expansions.items():
        if key in query_lower:
            for synonym in synonyms:
                expanded_queries.append(query.replace(key, synonym, 1))

    return expanded_queries

def detect_metadata_filter(query: str) -> Optional[Dict[str, Any]]:
    """
    Look for trigger phrases in the query and return an appropriate
    metadata filter for your vector store.
    """
    q = query.lower()
    # 2) detect_metadata_filter() dictionary
    mapping = {
        # --- St. Jude navigation & new patients ---
        "new patient":      {"section": {"$eq": "Information for New Patients | St. Jude Care & Treatment"}},
        "first visit":      {"section": {"$eq": "Information for New Patients | St. Jude Care & Treatment"}},
    
        # --- Housing ---
        "housing":          {"section": {"$eq": "Housing and Patient Services - St. Jude Children’s Research Hospital"}},
        "target house":     {"section": {"$eq": "Housing and Patient Services"}},
        "tri delta":        {"section": {"$eq": "Housing and Patient Services"}},
        "domino's village": {"section": {"$eq": "Domino's Village Menu"}},
    
        # --- Food services / menus ---
        "kay kafe":         {"section": {"$eq": "Kay Kafe Menu"}},
        "kay cafe":         {"section": {"$eq": "Kay Kafe Menu"}},
        "room service":     {"section": {"$eq": "Room Service Menu - St. Jude Children’s Research Hospital"}},
        "isolation":        {"section": {"$eq": "Isolation To-Go Menu - St. Jude Children’s Research Hospital"}},
        "menu":             {"section": {"$eq": "Kay Kafe Menu"}},
        # "eat":              {"section": {"$eq": "Kay Kafe Menu | Breakfast | Lunch | Dinner"}},
    
        # --- Logistics ---
        "parking":          {"section": {"$eq": "Parking and Construction | St. Jude Care & Treatment"}},
        "directions":       {"section": {"$eq": "Parking and Construction | St. Jude Care & Treatment"}},
        "visitor":          {"section": {"$eq": "Visitors"}},
    
        # --- Patient portal & programs ---
        "mychart":          {"section": {"$eq": "St. Jude MyChart"}},
        "child life":       {"section": {"$eq": "Child Life | St. Jude Care & Treatment"}},
        "school program":   {"section": {"$eq": "The St. Jude School Program | St. Jude Care & Treatment"}},
    
        # --- Clinical trials / research ---
        "clinical trial":   {"section": {"$eq": "Clinical Trials | St. Jude Care & Treatment"}},
        "consent":          {"section": {"$eq": "Understanding and signing consent forms"}},
    
        # --- Policies / legal ---
        "hipaa":            {"title":   {"$eq": "Notice of Privacy Practices (HIPAA) - St. Jude Children’s Research Hospital"}},
        "privacy":          {"section": {"$eq": "Privacy & Legal"}},
        "nondiscrimination":{"section": {"$eq": "Discrimination is against the law"}},
    
        # --- Support services / community ---
        "concierge":        {"section": {"$eq": "Best Upon Request Concierge Service\u202f | St. Jude Care & Treatment"}},
        "st. jude voice":   {"section": {"$eq": "St. Jude Voice: Our Virtual Adviser community | St. Jude Care & Treatment"}},
    
        # --- Treatments ---
        "chemotherapy":     {"section": {"$eq": "Chemotherapy"}},
        "radiation":        {"section": {"$eq": "Radiation therapy"}},
        "surgery":          {"section": {"$eq": "Surgery"}},
        "targeted therapy": {"section": {"$eq": "Targeted therapy"}}
}

    # Regex-based mapping: if query contains both "eat" and "where"
    PAIR_RULES: List[Tuple[re.Pattern, List[str]]] = [
    # where + eat → any dining section
    (re.compile(r"\b(?:where|location|find|near|place|available|open|closest|nearby|there)\b.*\b(?:eat|food|meal|dining|cafe|kafe|menu|restaurant|cafeteria|kitchen|snack|coffee)\b"
    r"|"
    r"\b(?:eat|food|meal|dining|cafe|kafe|menu|restaurant|cafeteria|kitchen|snack|coffee)\b.*\b(?:where|location|find|near|place|available|open|closest|nearby|there)\b", re.I),
     ["Domino's Village Menu",
     'Sunday',
     'Breakfast',
     'Lunch',
     'Dinner',
     'Saturday',
     'Isolation To-Go Menu - St. Jude Children’s Research Hospital',
     'Inpatient Room Service Daily Dinner Special',
     'Friday',
     'Monday',
     'Tuesday',
     'Wednesday',
     'Thursday',
     'Room Service Menu - St. Jude Children’s Research Hospital',
     'Kay Kafe Menu',
     'Meal Plans and Assistance - St. Jude Children’s Research Hospital',
     'Snack Bags - St. Jude Children’s Research Hospital',
     'Starbucks - St. Jude Children’s Research Hospital',
     'Contact Us - St. Jude Children’s Research Hospital',
     'Food on Campus'])
]
    # regex_mapping = [
    #     (
    #         re.compile(r"\bwhere\b.*\beat\b|\beat\b.*\bwhere\b"),
    #         [
    #             {"section": {"$eq": "Breakfast"}},
    #             {"section": {"$eq": "Lunch"}},
    #             {"section": {"$eq": "Dinner"}},
    #         ]
    #     )
    # ]

    for trigger, filt in mapping.items():
        if trigger in q:
            return filt

    for pat, sections in PAIR_RULES:
        if pat.search(query):
            return {"section": {"$in": sections}}
    return None

def detect_metadata_filter(query: str) -> Optional[Dict[str, Any]]:
    """
    Look for trigger phrases in the query and return an appropriate
    metadata filter for your vector store.
    """
    q = query.lower()
    # 2) detect_metadata_filter() dictionary
    mapping = {
        # --- St. Jude navigation & new patients ---
        "new patient":      {"section": {"$eq": "Information for New Patients | St. Jude Care & Treatment"}},
        "first visit":      {"section": {"$eq": "Information for New Patients | St. Jude Care & Treatment"}},
    
        # --- Housing ---
        "housing":          {"section": {"$eq": "Housing and Patient Services - St. Jude Children’s Research Hospital"}},
        "target house":     {"section": {"$eq": "Housing and Patient Services"}},
        "tri delta":        {"section": {"$eq": "Housing and Patient Services"}},
        "domino's village": {"section": {"$eq": "Domino's Village Menu"}},
    
        # --- Food services / menus ---
        "kay kafe":         {"section": {"$eq": "Kay Kafe Menu"}},
        "kay cafe":         {"section": {"$eq": "Kay Kafe Menu"}},
        "room service":     {"section": {"$eq": "Room Service Menu - St. Jude Children’s Research Hospital"}},
        "isolation":        {"section": {"$eq": "Isolation To-Go Menu - St. Jude Children’s Research Hospital"}},
        "menu":             {"section": {"$eq": "Kay Kafe Menu"}},
        # "eat":              {"section": {"$eq": "Kay Kafe Menu | Breakfast | Lunch | Dinner"}},
    
        # --- Logistics ---
        "parking":          {"section": {"$eq": "Parking and Construction | St. Jude Care & Treatment"}},
        "directions":       {"section": {"$eq": "Parking and Construction | St. Jude Care & Treatment"}},
        "visitor":          {"section": {"$eq": "Visitors"}},
    
        # --- Patient portal & programs ---
        "mychart":          {"section": {"$eq": "St. Jude MyChart"}},
        "child life":       {"section": {"$eq": "Child Life | St. Jude Care & Treatment"}},
        "school program":   {"section": {"$eq": "The St. Jude School Program | St. Jude Care & Treatment"}},
    
        # --- Clinical trials / research ---
        "clinical trial":   {"section": {"$eq": "Clinical Trials | St. Jude Care & Treatment"}},
        "consent":          {"section": {"$eq": "Understanding and signing consent forms"}},
    
        # --- Policies / legal ---
        "hipaa":            {"title":   {"$eq": "Notice of Privacy Practices (HIPAA) - St. Jude Children’s Research Hospital"}},
        "privacy":          {"section": {"$eq": "Privacy & Legal"}},
        "nondiscrimination":{"section": {"$eq": "Discrimination is against the law"}},
    
        # --- Support services / community ---
        "concierge":        {"section": {"$eq": "Best Upon Request Concierge Service\u202f | St. Jude Care & Treatment"}},
        "st. jude voice":   {"section": {"$eq": "St. Jude Voice: Our Virtual Adviser community | St. Jude Care & Treatment"}},
    
        # --- Treatments ---
        "chemotherapy":     {"section": {"$eq": "Chemotherapy"}},
        "radiation":        {"section": {"$eq": "Radiation therapy"}},
        "surgery":          {"section": {"$eq": "Surgery"}},
        "targeted therapy": {"section": {"$eq": "Targeted therapy"}}
}

    # Regex-based mapping: if query contains both "eat" and "where"
    PAIR_RULES: List[Tuple[re.Pattern, List[str]]] = [
    # where + eat → any dining section
    (re.compile(r"\b(?:where|location|find|near|place|available|open|closest|nearby|there)\b.*\b(?:eat|food|meal|dining|cafe|kafe|menu|restaurant|cafeteria|kitchen|snack|coffee)\b"
    r"|"
    r"\b(?:eat|food|meal|dining|cafe|kafe|menu|restaurant|cafeteria|kitchen|snack|coffee)\b.*\b(?:where|location|find|near|place|available|open|closest|nearby|there)\b", re.I),
     ["Domino's Village Menu",
     'Sunday',
     'Breakfast',
     'Lunch',
     'Dinner',
     'Saturday',
     'Isolation To-Go Menu - St. Jude Children’s Research Hospital',
     'Inpatient Room Service Daily Dinner Special',
     'Friday',
     'Monday',
     'Tuesday',
     'Wednesday',
     'Thursday',
     'Room Service Menu - St. Jude Children’s Research Hospital',
     'Kay Kafe Menu',
     'Meal Plans and Assistance - St. Jude Children’s Research Hospital',
     'Snack Bags - St. Jude Children’s Research Hospital',
     'Starbucks - St. Jude Children’s Research Hospital',
     'Contact Us - St. Jude Children’s Research Hospital',
     'Food on Campus'])
]
    # regex_mapping = [
    #     (
    #         re.compile(r"\bwhere\b.*\beat\b|\beat\b.*\bwhere\b"),
    #         [
    #             {"section": {"$eq": "Breakfast"}},
    #             {"section": {"$eq": "Lunch"}},
    #             {"section": {"$eq": "Dinner"}},
    #         ]
    #     )
    # ]

    for trigger, filt in mapping.items():
        if trigger in q:
            return filt

    for pat, sections in PAIR_RULES:
        if pat.search(query):
            return {"section": {"$in": sections}}
    return None