/**
 * Inserts date separator objects into a list of messages whenever the calendar day changes.
 * 
 * For each message, determines its date from `createdAt`, `timestamp`, or `time`. When a new date is encountered, a separator object with type `'date-separator'` and a localized date label is inserted before the message. Separator IDs are randomized if `randomizeId` is true.
 * 
 * @param {Array} messages - The array of message objects to process.
 * @param {boolean} [randomizeId=false] - Whether to randomize the separator IDs.
 * @return {Array} The array of messages with date separators inserted.
 */
function insertDateSeparators(messages, randomizeId = false) {
  const withSeparators = [];
  let lastDate = null;
  messages.forEach(msg => {
    const msgDate = new Date(msg.createdAt || msg.timestamp || msg.time);
    if (isNaN(msgDate.getTime())) {
      withSeparators.push(msg);
      return;
    }
    // Use YYYY-MM-DD string for comparison
    const year = msgDate.getFullYear();
    const month = String(msgDate.getMonth() + 1).padStart(2, '0');
    const day = String(msgDate.getDate()).padStart(2, '0');
    const dayString = `${year}-${month}-${day}`;
    const label = msgDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    if (lastDate !== dayString) {
      withSeparators.push({
        type: 'date-separator',
        date: label,
        id: randomizeId ? `date-${dayString}-${Math.random()}` : `date-${dayString}`
      });
      lastDate = dayString;
    }
    withSeparators.push(msg);
  });
  return withSeparators;
}
// Zustand store for chat state and persistence.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMessages, fetchLatestMessages, fetchOlderMessages } from '../utils/api';
import { fetchParticipants } from '../utils/api';
import { fetchMessageUpdates, fetchParticipantUpdates } from '../utils/api';

/**
 * Attaches participant information to each message based on matching participant identifiers.
 * 
 * For each message, finds the corresponding participant using various possible identifier fields and adds a `participant` object to the message. If the participant lacks an avatar URL, a default avatar is generated from their name.
 * 
 * @param {Array} messages - The array of message objects to enrich.
 * @param {Array} participants - The array of participant objects to match against.
 * @return {Array} A new array of messages, each with an added `participant` property.
 */
function enrichMessagesWithParticipants(messages, participants) {
  const participantMap = {};
  participants.forEach(p => {
    participantMap[p.uuid] = p;
  });
  return messages.map(msg => {
    const key = msg.authorUuid || msg.participantUuid || msg.senderUuid || msg.sender || msg.participant || '';
    let participant = participantMap[key] || {};
    participant = {
      ...participant,
      avatar: participant.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(participant.name || 'User'),
    };
    return {
      ...msg,
      participant,
      attachments: msg.attachments || [],
    };
  });
}

const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      participants: [],
      setMessages: (messages) => set({ messages }),
      setParticipants: (participants) => set({ participants }),
      fetchAndSetMessages: async () => {
        try {
          const [messages, participants] = await Promise.all([
            fetchLatestMessages(),
            fetchParticipants(),
          ]);
          // Enrich messages with participant info
          const enrichedMessages = enrichMessagesWithParticipants(messages, participants);
          // Insert date separators
          const withSeparators = insertDateSeparators(enrichedMessages);
          set({ messages: withSeparators, participants });
        } catch (err) {
          console.error('Error in fetchAndSetMessages:', err);
        }
      },
      // Load older messages for infinite scroll
      loadOlderMessages: async () => {
        const currentMessages = get().messages;
        if (!currentMessages || currentMessages.length === 0) return;
        // Find the first real message (skip separators)
        const oldest = currentMessages.find(m => !m.type);
        const refUuid = oldest && (oldest.id || oldest.uuid);
        if (!refUuid) return;
        try {
          const olderMessages = await fetchOlderMessages(refUuid);
          const participants = get().participants;
          const enrichedOlder = enrichMessagesWithParticipants(olderMessages, participants);
          // Insert date separators for older messages
          const withSeparators = insertDateSeparators(enrichedOlder, true);
          // Prepend older messages, filter out duplicates
          const currentUuids = new Set(currentMessages.map(m => m.uuid || m.id));
          const newOlder = withSeparators.filter(m => !currentUuids.has(m.uuid || m.id));
          set({ messages: [...newOlder, ...currentMessages] });
        } catch (err) {
          console.error('Error in loadOlderMessages:', err);
        }
      },
      // Poll for real-time updates
      startPollingUpdates: () => {
        // Always clear any previous interval before starting a new one
        if (get()._pollingInterval) {
          clearInterval(get()._pollingInterval);
          set({ _pollingInterval: null });
        }
        // Configurable polling intervals and retry/backoff
        const POLL_INTERVAL_DEFAULT = 4000;
        const POLL_INTERVAL_SLOW = 15000;
        const MAX_RETRIES = 5;
        const BACKOFF_FACTOR = 2;
        const BACKOFF_MAX = 60000;
        let pollIntervalMs = POLL_INTERVAL_DEFAULT;
        let retryCount = 0;
        let lastMessageUpdate = Date.now();
        let lastParticipantUpdate = Date.now();
        let interval = null;

        const poll = async () => {
          let gotUpdate = false;
          try {
            // Get latest update times from current messages/participants
            const messages = get().messages.filter(m => !m.type);
            if (messages.length > 0) {
              lastMessageUpdate = Math.max(...messages.map(m => Number(m.updatedAt || m.sentAt || m.time || 0)));
            }
            const participants = get().participants;
            if (participants.length > 0) {
              lastParticipantUpdate = Math.max(...participants.map(p => Number(p.updatedAt || p.time || 0)));
            }
            // Poll for message updates
            const updatedMessages = await fetchMessageUpdates(lastMessageUpdate);
            if (updatedMessages && updatedMessages.length > 0) {
              gotUpdate = true;
              // Merge updated messages
              const allMessages = [...get().messages.filter(m => !m.type)];
              updatedMessages.forEach(msg => {
                const idx = allMessages.findIndex(m => m.uuid === msg.uuid);
                if (idx !== -1) {
                  allMessages[idx] = msg;
                } else {
                  allMessages.push(msg);
                }
              });
              // Sort messages by sentAt/updatedAt/time ascending
              allMessages.sort((a, b) => {
                const ta = Number(a.updatedAt || a.sentAt || a.time || 0);
                const tb = Number(b.updatedAt || b.sentAt || b.time || 0);
                return ta - tb;
              });
              // Enrich and insert separators
              const enriched = enrichMessagesWithParticipants(allMessages, get().participants);
              const withSeparators = insertDateSeparators(enriched);
              set({ messages: withSeparators });
            }
            // Poll for participant updates
            const updatedParticipants = await fetchParticipantUpdates(lastParticipantUpdate);
            if (updatedParticipants && updatedParticipants.length > 0) {
              gotUpdate = true;
              // Merge updated participants
              const allParticipants = [...get().participants];
              updatedParticipants.forEach(p => {
                const idx = allParticipants.findIndex(x => x.uuid === p.uuid);
                if (idx !== -1) {
                  allParticipants[idx] = p;
                } else {
                  allParticipants.push(p);
                }
              });
              set({ participants: allParticipants });
            }
            // If no updates, slow down polling, else reset to default
            if (!gotUpdate && pollIntervalMs !== POLL_INTERVAL_SLOW) {
              pollIntervalMs = POLL_INTERVAL_SLOW;
            } else if (gotUpdate && pollIntervalMs !== POLL_INTERVAL_DEFAULT) {
              pollIntervalMs = POLL_INTERVAL_DEFAULT;
            }
            retryCount = 0; // Reset retry count on success
          } catch (err) {
            retryCount += 1;
            console.error('Polling error:', err);
            // Exponential backoff on error
            pollIntervalMs = Math.min(pollIntervalMs * BACKOFF_FACTOR, BACKOFF_MAX);
            if (retryCount > MAX_RETRIES) {
              console.error('Polling stopped after max retries');
              if (interval) {
                clearInterval(interval);
                set({ _pollingInterval: null });
              }
              return;
            }
          }
          // Adjust interval dynamically
          if (interval) {
            clearInterval(interval);
          }
          interval = setInterval(poll, pollIntervalMs);
          set({ _pollingInterval: interval });
        };
        interval = setInterval(poll, pollIntervalMs);
        set({ _pollingInterval: interval });
      },
      stopPollingUpdates: () => {
        const interval = get()._pollingInterval;
        if (interval) {
          clearInterval(interval);
          set({ _pollingInterval: null });
        }
      },
      _pollingInterval: null,
    }),
    {
      name: 'chat-storage', // storage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useChatStore;
