import { create } from 'zustand';

interface ChatState {
  isOpen: boolean;
  toggleChat: () => void;
}

const useChatStore = create<ChatState>((set, get) => ({ // Thêm 'get'
  isOpen: false,
  toggleChat: () => {
    const nextIsOpen = !get().isOpen; // Lấy trạng thái sắp tới

    // --- BỔ SUNG LOGIC DỌN DẸP ---
    if (!nextIsOpen && document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
    // --- KẾT THÚC BỔ SUNG ---

    set({ isOpen: nextIsOpen });
  },
}));

export default useChatStore;