// Zustand store for chat state and persistence.
import create from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      participants: [],
      setMessages: (messages) => set({ messages }),
      setParticipants: (participants) => set({ participants }),
      // Add more actions as needed
    }),
    {
      name: 'chat-storage', // storage key
    }
  )
);

export default useChatStore;
