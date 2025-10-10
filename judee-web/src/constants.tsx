const API_BASE_URL = 'http://localhost:3001/api';
const TTS_BASE_URL = 'http://localhost:8000/';

const API_ENDPOINTS = {
  TTS_BASE_URL: TTS_BASE_URL,
  CHAT_API: `${API_BASE_URL}/chat`,
  TRANSCRIBE: `http://localhost:8000/get_transcribe`,
  TTS_API_URL: `${TTS_BASE_URL}tts`,
};

const PAGES = {
  HOME: '/',
}

export { API_BASE_URL, API_ENDPOINTS, PAGES };
