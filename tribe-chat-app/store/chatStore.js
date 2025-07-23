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
    }),
    {
      name: 'chat-storage', // storage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useChatStore;
