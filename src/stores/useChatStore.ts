import { create } from 'zustand';

interface ChatState {
  isOpen: boolean;
  toggleChat: () => void;
}

const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export default useChatStore;
