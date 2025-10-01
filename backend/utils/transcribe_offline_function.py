#!/usr/bin/env python3
# SPDX-FileCopyrightText: Copyright (c) 2022 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: MIT

"""
Python function wrapper for offline transcription.
Converts the command-line interface to a programmatic function call.

INSTALLATION REQUIRED:
Before using this module, you must install the riva-client package:

    git submodule init
    git submodule update --remote --recursive
    pip install -r requirements.txt
    python3 setup.py bdist_wheel
    pip install --force-reinstall dist/*.whl

This will generate the required protobuf files.
"""

import os
import sys
from pathlib import Path
from typing import Optional, List, Union

try:
    import grpc
    import riva.client
    import riva.client.proto.riva_asr_pb2
except ModuleNotFoundError as e:
    print("=" * 70)
    print("ERROR: Required modules not found!")
    print("=" * 70)
    print("\nPlease install the riva-client package first:")
    print("\n  cd /Users/jpatel2/Desktop/github_repos/python-clients")
    print("  git submodule init")
    print("  git submodule update --remote --recursive")
    print("  pip install -r requirements.txt")
    print("  python3 setup.py bdist_wheel")
    print("  pip install --force-reinstall dist/*.whl")
    print("\nThis will generate the required protobuf files.")
    print("=" * 70)
    sys.exit(1)


def transcribe_file_offline(
    input_file: Union[str, Path],
    server: str = "localhost:50051",
    use_ssl: bool = False,
    metadata: Optional[List[List[str]]] = None,
    language_code: str = "en-US",
    word_time_offsets: bool = False,
    automatic_punctuation: bool = False,
    model_name: Optional[str] = None,
    max_alternatives: int = 1,
    profanity_filter: bool = False,
    no_verbatim_transcripts: bool = False,
    speaker_diarization: bool = False,
    diarization_max_speakers: int = 64,
    boosted_lm_words: Optional[List[str]] = None,
    boosted_lm_score: float = 4.0,
    start_history: int = 0,
    start_threshold: float = 0.0,
    stop_history: int = 0,
    stop_history_eou: int = 0,
    stop_threshold: float = 0.0,
    stop_threshold_eou: float = 0.0,
    custom_configuration: str = "",
    max_message_length: int = 134217728,
    ssl_root_cert: Optional[Union[str, Path]] = None,
    ssl_client_cert: Optional[Union[str, Path]] = None,
    ssl_client_key: Optional[Union[str, Path]] = None,
    output_seglst: bool = False,
    print_results: bool = True,
) -> Optional[riva.client.proto.riva_asr_pb2.RecognizeResponse]:
    """
    Perform offline file transcription via Riva AI Services.
    
    "Offline" means that entire audio content is sent in one request 
    and then a transcript for whole file is received in one response.
    
    Args:
        input_file: Path to a local audio file to transcribe
        server: URI of the Riva server (host:port)
        use_ssl: Whether to use SSL/TLS for secure connection
        metadata: List of metadata key-value pairs for authentication
                  Example: [["function-id", "xxx"], ["authorization", "Bearer token"]]
        language_code: Language code for transcription (e.g., "en-US")
        word_time_offsets: Enable word-level timestamps
        automatic_punctuation: Enable automatic punctuation
        model_name: Specific model name to use (optional)
        max_alternatives: Maximum number of alternative transcripts
        profanity_filter: Enable profanity filtering
        no_verbatim_transcripts: Disable verbatim transcripts
        speaker_diarization: Enable speaker diarization
        diarization_max_speakers: Maximum number of speakers for diarization
        boosted_lm_words: List of words to boost in language model
        boosted_lm_score: Score to boost the specified words
        start_history: Start history for endpoint detection
        start_threshold: Start threshold for endpoint detection
        stop_history: Stop history for endpoint detection
        stop_history_eou: Stop history end-of-utterance
        stop_threshold: Stop threshold for endpoint detection
        stop_threshold_eou: Stop threshold end-of-utterance
        custom_configuration: Custom configuration string (key:value,key:value)
        max_message_length: Maximum gRPC message length
        ssl_root_cert: Path to SSL root certificate
        ssl_client_cert: Path to SSL client certificate
        ssl_client_key: Path to SSL client key
        output_seglst: Output seglst file for speaker diarization
        print_results: Whether to print results (default: True)
    
    Returns:
        RecognizeResponse object containing the transcription results,
        or None if an error occurs
    
    Example:
        >>> # Basic usage matching the command
        >>> response = transcribe_file_offline(
        ...     input_file="./data/examples/en-US_sample.wav",
        ...     server="grpc.nvcf.nvidia.com:443",
        ...     use_ssl=True,
        ...     metadata=[
        ...         ["function-id", "d3fe9151-442b-4204-a70d-5fcc597fd610"],
        ...         ["authorization", "Bearer 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"]
        ...     ],
        ...     language_code="en-US",
        ...     word_time_offsets=True,
        ...     automatic_punctuation=True
        ... )
        >>> 
        >>> # Access results programmatically
        >>> if response and len(response.results) > 0:
        ...     transcript = response.results[0].alternatives[0].transcript
        ...     print(f"Transcript: {transcript}")
        ...     
        ...     # Access word-level timestamps if enabled
        ...     if response.results[0].alternatives[0].words:
        ...         for word_info in response.results[0].alternatives[0].words:
        ...             print(f"{word_info.word}: {word_info.start_time}ms - {word_info.end_time}ms")
    """
    # Expand and validate input file path
    input_file_path = Path(input_file).expanduser()
    if not input_file_path.is_file():
        print(f"Invalid input file path: {input_file_path}")
        return None
    
    # Set up gRPC options
    options = [
        ('grpc.max_receive_message_length', max_message_length),
        ('grpc.max_send_message_length', max_message_length)
    ]
    
    # Create authentication object
    auth = riva.client.Auth(
        ssl_root_cert=ssl_root_cert,
        ssl_client_cert=ssl_client_cert,
        ssl_client_key=ssl_client_key,
        use_ssl=use_ssl,
        uri=server,
        metadata_args=metadata,
        options=options
    )
    
    # Create ASR service
    asr_service = riva.client.ASRService(auth)
    
    # Create recognition config
    config = riva.client.RecognitionConfig(
        language_code=language_code,
        model=model_name,
        max_alternatives=max_alternatives,
        profanity_filter=profanity_filter,
        enable_automatic_punctuation=automatic_punctuation,
        verbatim_transcripts=not no_verbatim_transcripts,
        enable_word_time_offsets=word_time_offsets or speaker_diarization,
    )
    
    # Add word boosting if specified
    riva.client.add_word_boosting_to_config(config, boosted_lm_words, boosted_lm_score)
    
    # Add speaker diarization if enabled
    riva.client.add_speaker_diarization_to_config(
        config, speaker_diarization, diarization_max_speakers
    )
    
    # Add endpoint parameters
    riva.client.add_endpoint_parameters_to_config(
        config,
        start_history,
        start_threshold,
        stop_history,
        stop_history_eou,
        stop_threshold,
        stop_threshold_eou
    )
    
    # Add custom configuration
    riva.client.add_custom_configuration_to_config(config, custom_configuration)
    
    # Read audio file
    with input_file_path.open('rb') as fh:
        data = fh.read()
    
    # Perform recognition
    try:
        response = asr_service.offline_recognize(data, config)
        
        # Print results if requested (similar to the CLI script)
        if print_results:
            seglst_output_file = None
            if output_seglst:
                seglst_output_file = input_file_path.stem
            
            riva.client.print_offline(
                response=response,
                speaker_diarization=speaker_diarization,
                seglst_output_file=seglst_output_file
            )
        
        return response
        
    except grpc.RpcError as e:
        print(f"gRPC Error: {e.details()}")
        return None


def list_models(
    server: str = "localhost:50051",
    use_ssl: bool = False,
    metadata: Optional[List[List[str]]] = None,
    max_message_length: int = 134217728,
    ssl_root_cert: Optional[Union[str, Path]] = None,
    ssl_client_cert: Optional[Union[str, Path]] = None,
    ssl_client_key: Optional[Union[str, Path]] = None,
) -> Optional[dict]:
    """
    List available ASR models from the Riva server.
    
    Args:
        server: URI of the Riva server (host:port)
        use_ssl: Whether to use SSL/TLS for secure connection
        metadata: List of metadata key-value pairs for authentication
        max_message_length: Maximum gRPC message length
        ssl_root_cert: Path to SSL root certificate
        ssl_client_cert: Path to SSL client certificate
        ssl_client_key: Path to SSL client key
    
    Returns:
        Dictionary of available models organized by language code,
        or None if an error occurs
    
    Example:
        >>> models = list_models(
        ...     server="grpc.nvcf.nvidia.com:443",
        ...     use_ssl=True,
        ...     metadata=[["authorization", "Bearer token"]]
        ... )
        >>> if models:
        ...     print("Available models:", models)
    """
    # Set up gRPC options
    options = [
        ('grpc.max_receive_message_length', max_message_length),
        ('grpc.max_send_message_length', max_message_length)
    ]
    
    # Create authentication object
    auth = riva.client.Auth(
        ssl_root_cert=ssl_root_cert,
        ssl_client_cert=ssl_client_cert,
        ssl_client_key=ssl_client_key,
        use_ssl=use_ssl,
        uri=server,
        metadata_args=metadata,
        options=options
    )
    
    # Create ASR service
    asr_service = riva.client.ASRService(auth)
    
    try:
        asr_models = dict()
        config_response = asr_service.stub.GetRivaSpeechRecognitionConfig(
            riva.client.proto.riva_asr_pb2.RivaSpeechRecognitionConfigRequest()
        )
        
        for model_config in config_response.model_config:
            if model_config.parameters["type"] == "offline":
                language_code = model_config.parameters['language_code']
                model = {"model": [model_config.model_name]}
                if language_code in asr_models:
                    asr_models[language_code].append(model)
                else:
                    asr_models[language_code] = [model]
        
        asr_models = dict(sorted(asr_models.items()))
        print("Available ASR models")
        print(asr_models)
        return asr_models
        
    except grpc.RpcError as e:
        print(f"gRPC Error: {e.details()}")
        return None


if __name__ == "__main__":
    # Example usage matching the original command
    print("Example 1: Transcribing with NVCF service")
    print("=" * 60)
    
    response = transcribe_file_offline(
        input_file="./data/examples/en-US_sample.wav",
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
    
    if response and len(response.results) > 0:
        print("\n" + "=" * 60)
        print("SUCCESS: Transcription completed!")
        print("=" * 60)
        transcript = response.results[0].alternatives[0].transcript
        print(f"\nFinal Transcript: {transcript}")
        
        # Show word-level details if available
        if response.results[0].alternatives[0].words:
            print(f"\nNumber of words: {len(response.results[0].alternatives[0].words)}")
    else:
        print("\n" + "=" * 60)
        print("FAILED: Transcription failed.")
        print("=" * 60)
