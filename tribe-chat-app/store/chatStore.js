// Zustand store for chat state and persistence.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMessages, fetchLatestMessages, fetchOlderMessages } from '../utils/api';
import { fetchParticipants } from '../utils/api';

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
            fetchMessages(),
            fetchParticipants(),
          ]);
          // Join participant info into each message
          const participantMap = {};
          participants.forEach(p => {
            participantMap[p.uuid] = p;
          });
          const enrichedMessages = messages.map(msg => {
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
          set({ messages: enrichedMessages, participants });
        } catch (err) {
          // Silent fail
        }
      },
      // Load older messages for infinite scroll
      loadOlderMessages: async () => {
        const currentMessages = get().messages;
        if (!currentMessages || currentMessages.length === 0) return;
        const oldest = currentMessages[0];
        const refUuid = oldest.id || oldest.uuid;
        try {
          const olderMessages = await fetchOlderMessages(refUuid);
          const participants = get().participants;
          const participantMap = {};
          participants.forEach(p => {
            participantMap[p.uuid] = p;
          });
          const enrichedOlder = olderMessages.map(msg => {
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
          // Prepend older messages
          set({ messages: [...enrichedOlder, ...currentMessages] });
        } catch (err) {
          // Silent fail
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
