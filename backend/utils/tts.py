import json
import wave
import uuid
import time
from pathlib import Path

import riva.client
from riva.client.proto.riva_audio_pb2 import AudioEncoding
import riva.client.proto.riva_tts_pb2 as riva_tts

OUTPUT_DIR = Path("files")
OUTPUT_DIR.mkdir(exist_ok=True)


def get_tts_service(server: str, use_ssl: bool = False, metadata: list[tuple[str, str]] = None):
    auth = riva.client.Auth(
        use_ssl=use_ssl,
        uri=server,
        metadata_args=metadata or [],
        options=[
            ('grpc.max_receive_message_length', 1024 * 1024 * 100),
            ('grpc.max_send_message_length', 1024 * 1024 * 100),
        ],
    )
    return riva.client.SpeechSynthesisService(auth)


def list_voices(service):
    """
    Returns available voices grouped by language code.
    """
    config_response = service.stub.GetRivaSynthesisConfig(
        riva_tts.RivaSynthesisConfigRequest()
    )

    voices = {}
    for model_config in config_response.model_config:
        language_code = model_config.parameters['language_code']
        voice_name = model_config.parameters['voice_name']
        subvoices = [v.split(':')[0] for v in model_config.parameters['subvoices'].split(',')]
        full_voice_names = [f"{voice_name}.{sub}" for sub in subvoices]

        if language_code not in voices:
            voices[language_code] = []
        voices[language_code].extend(full_voice_names)

    return voices


def synthesize_text_to_wav(
    text: str,
    server: str,
    voice: str = None,
    language_code: str = "en-US",
    sample_rate_hz: int = 44100,
    encoding: str = "LINEAR_PCM",
    metadata: list[tuple[str, str]] = None,
    use_ssl: bool = True,
) -> tuple[str, float]:
    """
    Synthesizes text to a WAV file and returns (file_path, time_spent).
    """
    service = get_tts_service(server, use_ssl=use_ssl, metadata=metadata)

    # Get available voices
    voices = list_voices(service)

    # Pick voice if not explicitly provided
    if not voice:
        available = voices.get(language_code, [])
        if not available:
            raise ValueError(f"No voices available for language {language_code}")
        voice = available[0]  # pick the first available voice

    # Correct encoding enum
    encoding_enum = AudioEncoding.OGGOPUS if encoding == "OGGOPUS" else AudioEncoding.LINEAR_PCM

    start = time.time()
    resp = service.synthesize(
        text,
        voice,
        language_code,
        sample_rate_hz=sample_rate_hz,
        encoding=encoding_enum,
    )
    stop = time.time()

    # Generate unique file name
    file_id = str(uuid.uuid4())
    file_path = OUTPUT_DIR / f"{file_id}.wav"

    # Write audio to WAV file
    with wave.open(str(file_path), 'wb') as out_f:
        out_f.setnchannels(1)
        out_f.setsampwidth(2)
        out_f.setframerate(sample_rate_hz)
        out_f.writeframes(resp.audio)

    return str(file_path), round(stop - start, 3)
