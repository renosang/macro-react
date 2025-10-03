import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localForage from 'localforage';
import { Category, Macro, Announcement } from '../types';

export interface DataState {
  categories: Category[];
  macros: Macro[];
  announcements: Announcement[];
  _hasHydrated: boolean; // Thêm flag này
  setHasHydrated: (hydrated: boolean) => void;
  fetchInitialData: () => Promise<void>; // Gom các hàm fetch lại
  setMacros: (macros: Macro[]) => void;
}

const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      categories: [],
      macros: [],
      announcements: [],
      _hasHydrated: false, // Ban đầu là false

      setHasHydrated: (hydrated) => {
        set({ _hasHydrated: hydrated });
      },

      // Gom các hàm fetch lại để gọi một lần
      fetchInitialData: async () => {
        // Chỉ fetch khi chưa có dữ liệu
        if (get().categories.length > 0 && get().macros.length > 0) {
          return;
        }
        try {
          const [categoriesRes, macrosRes, announcementsRes] = await Promise.all([
            fetch('/api/categories'),
            fetch('/api/macros'),
            fetch('/api/announcements')
          ]);

          if (!categoriesRes.ok || !macrosRes.ok || !announcementsRes.ok) {
            throw new Error('Failed to fetch initial data');
          }

          const categoriesData = await categoriesRes.json();
          const macrosData = await macrosRes.json();
          const announcementsData = await announcementsRes.json();

          set({ 
            categories: categoriesData, 
            macros: macrosData, 
            announcements: announcementsData 
          });
        } catch (error) {
          console.error('Error fetching initial data:', error);
        }
      },

      setMacros: (newMacros) => set({ macros: newMacros }),
    }),
    {
      name: 'data-storage',
      storage: createJSONStorage(() => localForage),
      // Đây là phần quan trọng:
      onRehydrateStorage: () => (state) => {
        // Khi quá trình phục hồi hoàn tất, gọi action để cập nhật flag
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useDataStore;