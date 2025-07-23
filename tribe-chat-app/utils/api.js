// API functions for fetching and sending chat data.
const API_BASE = 'https://dummy-chat-server.tribechat.com/api';

/**
 * Retrieves all chat messages from the server.
 * @return {Promise<Object>} A promise that resolves to the list of all chat messages.
 */
export async function fetchMessages() {
  const res = await fetch(`${API_BASE}/messages/all`);
  return res.json();
}

/**
 * Retrieves the latest chat messages from the server.
 * @returns {Promise<Object>} A promise that resolves to the latest messages as a JSON object.
 * @throws {Error} If the HTTP request fails or a network error occurs.
 */
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

/**
 * Fetches chat messages older than the specified reference message UUID.
 *
 * @param {string} refMessageUuid - The UUID of the reference message to fetch older messages from. Must be a valid, non-empty UUID string.
 * @return {Promise<Object>} A promise that resolves to the JSON response containing older messages.
 * @throws {Error} If the reference UUID is invalid, if the HTTP response is not OK, or if a network error occurs.
 */
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

/**
 * Retrieves the list of all chat participants from the server.
 * @return {Promise<Object>} A promise that resolves to the parsed JSON response containing participant data.
 */
export async function fetchParticipants() {
  const res = await fetch(`${API_BASE}/participants/all`);
  return res.json();
}

// Add more API functions as needed
