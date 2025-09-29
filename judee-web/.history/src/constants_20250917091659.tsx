const API_BASE_URL = 'http://localhost:4000/api';

const API_ENDPOINTS = {
  SEQUENCE: `${API_BASE_URL}/sequence`,
  PROTEIN: `${API_BASE_URL}/protein`,
  PROTEIN_FILTER_BY_PIE: `${API_BASE_URL}/protein/filter/pie-filter`,
  NUCLEOTIDE: `${API_BASE_URL}/nucleotide`,
  NUCLEOTIDE_FILTER_BY_PIE: `${API_BASE_URL}/nucleotide/filter/pie-filter`,
  SEQUENCE_SEARCH: `${API_BASE_URL}/sequence/search`,
};

const PAGES = {
  HOME: '/',
  SEQUENCE_FILTER: '/sequence-filter',
  STRUCTURE: '/structure',
  TEMP: '/temp',
}

export { API_BASE_URL, API_ENDPOINTS, PAGES };
