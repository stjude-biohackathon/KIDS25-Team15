from transcribe_offline_function import transcribe_file_offline

def transcribe_wav(file_path):
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

	print(response)
	# Access results programmatically
	if response and len(response.results) > 0:
		transcript = response.results[0].alternatives[0].transcript
		print(f"Transcript: {transcript}")

	return transcript
