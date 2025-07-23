// Zustand store for chat state and persistence.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMessages } from '../utils/api';

const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      participants: [],
      setMessages: (messages) => set({ messages }),
      setParticipants: (participants) => set({ participants }),
      fetchAndSetMessages: async () => {
        try {
          const data = await fetchMessages();
          console.log('Fetched messages:', data);
          set({ messages: data });
        } catch (err) {
          console.error('Error fetching messages:', err);
        }
      },
      // Add more actions as needed
    }),
    {
      name: 'chat-storage', // storage key
      storage: AsyncStorage,
    }
  )
);

export default useChatStore;
