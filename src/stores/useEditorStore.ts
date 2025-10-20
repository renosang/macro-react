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
    (set) => ({
      isOpen: false,
      content: null,
      _hasHydrated: false,
      toggleEditor: () => set((state) => ({ isOpen: !state.isOpen })),
      setContent: (newContent) => set({ content: newContent }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'editor-storage',
      onRehydrateStorage: () => (state) => {
        // Vẫn giữ lại để đánh dấu đã hydrated, nhưng onFinishHydration sẽ an toàn hơn
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useEditorStore;

