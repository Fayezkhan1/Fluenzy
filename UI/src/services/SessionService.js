import { fetchWithAuth } from './AuthService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const saveSession = async (transcripts, durationSeconds, wordsSpoken) => {
  const res = await fetchWithAuth(`${API_URL}/api/practise/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcripts,
      duration_seconds: durationSeconds,
      words_spoken: wordsSpoken
    })
  });
  return res.json();
};

export const getSessions = async () => {
  const res = await fetchWithAuth(`${API_URL}/api/history/sessions`);
  return res.json();
};

export const getStats = async () => {
  const res = await fetchWithAuth(`${API_URL}/api/history/stats`);
  return res.json();
};

export const deleteSession = async (sessionId) => {
  const res = await fetchWithAuth(`${API_URL}/api/history/session/${sessionId}`, {
    method: 'DELETE'
  });
  return res.json();
};
