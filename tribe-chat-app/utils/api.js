// API functions for fetching and sending chat data.
const API_BASE = 'https://dummy-chat-server.tribechat.com/api';

export async function fetchMessages() {
  const res = await fetch(`${API_BASE}/messages/all`);
  return res.json();
}

export async function fetchParticipants() {
  const res = await fetch(`${API_BASE}/participants/all`);
  return res.json();
}

// Add more API functions as needed
