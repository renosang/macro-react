import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EditorState {
  isOpen: boolean;
  content: string | null;
  _hasHydrated: boolean;
  toggleEditor: () => void;
  setContent: (newContent: string | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({ // Thêm 'get'
      isOpen: false,
      content: null,
      _hasHydrated: false,
      toggleEditor: () => {
        const nextIsOpen = !get().isOpen; // Lấy trạng thái sắp tới

        // --- BỔ SUNG LOGIC DỌN DẸP ---
        // Nếu cửa sổ sắp đóng, hãy đảm bảo body cuộn được
        if (!nextIsOpen && document.body.style.overflow === 'hidden') {
          document.body.style.overflow = '';
        }
        // --- KẾT THÚC BỔ SUNG ---

        set({ isOpen: nextIsOpen });
      },
      setContent: (newContent) => set({ content: newContent }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'editor-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useEditorStore;