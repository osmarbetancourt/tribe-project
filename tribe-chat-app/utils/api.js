// API functions for fetching and sending chat data.
const API_BASE = 'https://dummy-chat-server.tribechat.com/api';

export async function fetchMessages() {
  const res = await fetch(`${API_BASE}/messages/all`);
  return res.json();
}

export async function fetchLatestMessages() {
  try {
    const res = await fetch(`${API_BASE}/messages/latest`);
    if (!res.ok) {
      throw new Error(`Failed to fetch latest messages: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    throw new Error(`Network error in fetchLatestMessages: ${err.message || err}`);
  }
}

export async function fetchOlderMessages(refMessageUuid) {
  // Validate refMessageUuid: must be a non-empty string and match UUID format
  if (
    typeof refMessageUuid !== 'string' ||
    !refMessageUuid.trim() ||
    !/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/.test(refMessageUuid.trim())
  ) {
    throw new Error('Invalid refMessageUuid provided to fetchOlderMessages');
  }
  try {
    const res = await fetch(`${API_BASE}/messages/older/${refMessageUuid}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch older messages: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    throw new Error(`Network error in fetchOlderMessages: ${err.message || err}`);
  }
}

export async function fetchParticipants() {
  const res = await fetch(`${API_BASE}/participants/all`);
  return res.json();
}

// Add more API functions as needed
