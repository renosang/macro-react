import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EditorState {
  isOpen: boolean;
  content: string | null;
  _hasHydrated: boolean; // <-- Tín hiệu báo đã nạp cache xong
  toggleEditor: () => void;
  setContent: (newContent: string | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      isOpen: false,
      content: null,
      _hasHydrated: false, // <-- Ban đầu chưa nạp
      toggleEditor: () => set((state) => ({ isOpen: !state.isOpen })),
      setContent: (newContent) => set({ content: newContent }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'editor-storage',
      // Khi nạp cache từ localStorage xong, tự động gọi action này
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

export default useEditorStore;