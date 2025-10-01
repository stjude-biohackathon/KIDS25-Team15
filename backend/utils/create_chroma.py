import chromadb

# go through all files in scrapped_data folder and add to collection
import os
from langchain.text_splitter import CharacterTextSplitter
from langchain.document_loaders import TextLoader
import csv

for filename in os.listdir("scrapped_data"):
	chroma_client = chromadb.PersistentClient(path="/app/chroma/.")
	# remove old collection if it exists
	# if chroma_client.get_collection(name="jude-e-documents"):
	# chroma_client.delete_collection(name="jude-e-documents")
	collection = chroma_client.get_or_create_collection(name="jude-e-documents")
	if filename.endswith(".csv"):
		filepath = os.path.join("scrapped_data", filename)
		with open(filepath, newline='', encoding='utf-8') as csvfile:
			reader = csv.reader(csvfile)
			all_docs = []
			all_metadatas = []
			all_ids = []
			for i, row in enumerate(reader):
				if len(row) < 3:
					continue  # skip malformed rows
				text = row[1]
				metadata = row[2]
				text_splitter = CharacterTextSplitter(separator="\n", chunk_size=1000, chunk_overlap=200)
				# Split the text from the 2nd column
				splits = text_splitter.split_text(text)
				for j, split in enumerate(splits):
					all_docs.append(split)
					all_metadatas.append({"source": filename, "metadata": metadata})
					all_ids.append(f"{filename}-{i}-{j}")
			if all_docs:
				collection.add(documents=all_docs, metadatas=all_metadatas, ids=all_ids)

# print number of documents in collection
print(f"Number of documents in collection: {collection.count()}")