// API functions for fetching and sending chat data.
const API_BASE = 'https://dummy-chat-server.tribechat.com/api';

/**
 * Retrieves all chat messages from the server.
 * @return {Promise<Object>} A promise that resolves to the list of all chat messages.
 */
export async function fetchMessages() {
  try {
    const res = await fetch(`${API_BASE}/messages/all`);
    if (!res.ok) {
      throw new Error(`Failed to fetch all messages: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    throw new Error(`Network error in fetchMessages: ${err.message || err}`);
  }
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
  try {
    const res = await fetch(`${API_BASE}/participants/all`);
    if (!res.ok) {
      throw new Error(`Failed to fetch participants: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    throw new Error(`Network error in fetchParticipants: ${err.message || err}`);
  }
}

/**
 * Sends a new message to the server.
 * @param {string} text - The message text to send.
 * @returns {Promise<Object>} The created message object from the server.
 */
export async function sendMessage(text) {
  // Validate input
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Message text must be a non-empty string');
  }
  try {
    const res = await fetch(`${API_BASE}/messages/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      throw new Error(`Failed to send message: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    throw new Error(`Network error in sendMessage: ${err.message || err}`);
  }
}

/**
 * Fetches messages updated after the given time (ms since epoch).
 * @param {number} time - Milliseconds since epoch.
 * @returns {Promise<Object[]>} Array of updated messages.
 */
export async function fetchMessageUpdates(time) {
  // Validate time: must be a valid number (timestamp) or a valid date string
  const isValidTimestamp = typeof time === 'number' && !isNaN(time) && time > 0;
  const isValidDateString = typeof time === 'string' && !isNaN(Date.parse(time));
  if (!isValidTimestamp && !isValidDateString) {
    throw new Error('Invalid time parameter for fetchMessageUpdates. Must be a valid timestamp or date string.');
  }
  try {
    const res = await fetch(`${API_BASE}/messages/updates/${time}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch message updates: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    throw new Error(`Network error in fetchMessageUpdates: ${err.message || err}`);
  }
}

/**
 * Fetches participants updated after the given time (ms since epoch).
 * @param {number} time - Milliseconds since epoch.
 * @returns {Promise<Object[]>} Array of updated participants.
 */
export async function fetchParticipantUpdates(time) {
  // Validate time: must be a valid number (timestamp) or a valid date string
  const isValidTimestamp = typeof time === 'number' && !isNaN(time) && time > 0;
  const isValidDateString = typeof time === 'string' && !isNaN(Date.parse(time));
  if (!isValidTimestamp && !isValidDateString) {
    throw new Error('Invalid time parameter for fetchParticipantUpdates. Must be a valid timestamp or date string.');
  }
  try {
    const res = await fetch(`${API_BASE}/participants/updates/${time}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch participant updates: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    throw new Error(`Network error in fetchParticipantUpdates: ${err.message || err}`);
  }
}

// Add more API functions as needed
