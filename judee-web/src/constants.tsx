const API_BASE_URL = 'http://localhost:3001/api';

const API_ENDPOINTS = {
  CHAT_API: `${API_BASE_URL}/chat`,
  TRANSCRIBE: `http://localhost:8000/get_transcribe`,
};

const PAGES = {
  HOME: '/',
}

export { API_BASE_URL, API_ENDPOINTS, PAGES };
