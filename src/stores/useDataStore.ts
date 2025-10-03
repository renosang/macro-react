import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localForage from 'localforage'; // 1. Import localForage
import { Category, Macro, Announcement } from '../types';

export interface DataState {
  categories: Category[];
  macros: Macro[];
  announcements: Announcement[];
  fetchCategories: () => Promise<void>;
  fetchMacros: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  setMacros: (macros: Macro[]) => void;
}

const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      categories: [],
      macros: [],
      announcements: [],

      fetchCategories: async () => {
        try {
          const response = await fetch('/api/categories');
          if (!response.ok) throw new Error('Failed to fetch categories');
          const data = await response.json();
          set({ categories: data });
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      },

      fetchMacros: async () => {
        try {
          const response = await fetch('/api/macros');
          if (!response.ok) throw new Error('Failed to fetch macros');
          const data = await response.json();
          set({ macros: data });
        } catch (error) {
          console.error('Error fetching macros:', error);
        }
      },
      
      fetchAnnouncements: async () => {
        try {
            const response = await fetch('/api/announcements');
            if (!response.ok) throw new Error('Failed to fetch announcements');
            const data = await response.json();
            set({ announcements: data });
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
      },

      setMacros: (newMacros) => set({ macros: newMacros }),
    }),
    { 
      name: 'data-storage',
      // 2. Thay thế storage mặc định bằng localForage
      storage: createJSONStorage(() => localForage),
    }
  )
);

export default useDataStore;