import chromadb

# go through all files in scrapped_data folder and add to collection
import os
from langchain.text_splitter import CharacterTextSplitter
from langchain.document_loaders import TextLoader

for filename in os.listdir("scrapped_data"):
	chroma_client = chromadb.PersistentClient(path="/app/chroma/.")
	# remove old collection if it exists
	# if chroma_client.get_collection(name="jude-e-documents"):
	# chroma_client.delete_collection(name="jude-e-documents")
	collection = chroma_client.get_or_create_collection(name="jude-e-documents")
	if filename.endswith(".csv"):
		loader = TextLoader(os.path.join("scrapped_data", filename))
		# get the 2nd column of the csv file
		data = loader.load()
		text_splitter = CharacterTextSplitter(separator="\n", chunk_size=1000, chunk_overlap=200)
		docs = text_splitter.split_documents(data)
		# add to collection
		collection.add(documents=[doc.page_content for doc in docs], metadatas=[{"source": filename} for doc in docs], ids=[f"{filename}-{i}" for i in range(len(docs))])	

# print number of documents in collection
print(f"Number of documents in collection: {collection.count()}")