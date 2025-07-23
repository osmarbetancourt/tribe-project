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
            fetchLatestMessages(),
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
          // Insert date separators
          const withSeparators = [];
          let lastDate = null;
          enrichedMessages.forEach(msg => {
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
            console.log('Comparing message dates:', { lastDate, current: dayString, label, createdAt: msg.createdAt, text: msg.text });
            if (lastDate !== dayString) {
              console.log('Inserting date separator:', label, 'between messages', lastDate, 'and', dayString);
              withSeparators.push({ type: 'date-separator', date: label, id: `date-${dayString}` });
              lastDate = dayString;
            }
            withSeparators.push(msg);
          });
          set({ messages: withSeparators, participants });
        } catch (err) {
          // Silent fail
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
          // Insert date separators for older messages
          const withSeparators = [];
          let lastDate = null;
          enrichedOlder.forEach(msg => {
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
            console.log('Comparing message dates:', { lastDate, current: dayString, label, createdAt: msg.createdAt, text: msg.text });
            if (lastDate !== dayString) {
              console.log('Inserting date separator:', label, 'between messages', lastDate, 'and', dayString);
              withSeparators.push({ type: 'date-separator', date: label, id: `date-${dayString}-${Math.random()}` });
              lastDate = dayString;
            }
            withSeparators.push(msg);
          });
          // Prepend older messages, filter out duplicates
          const currentUuids = new Set(currentMessages.map(m => m.uuid || m.id));
          const newOlder = withSeparators.filter(m => !currentUuids.has(m.uuid || m.id));
          set({ messages: [...newOlder, ...currentMessages] });
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
