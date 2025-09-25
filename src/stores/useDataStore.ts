import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Macro, Announcement } from '../types'; // Thêm Announcement

// Mở rộng interface để bao gồm cả các hàm fetch
export interface DataState {
  categories: Category[];
  macros: Macro[];
  announcements: Announcement[]; // Thêm announcements
  fetchCategories: () => Promise<void>;
  fetchMacros: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  setMacros: (macros: Macro[]) => void; // Giữ lại setMacros để cập nhật cục bộ nếu cần
}

const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      categories: [],
      macros: [],
      announcements: [],

      // Hàm để lấy danh sách chuyên mục
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

      // Hàm để lấy danh sách macro
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
      
      // Hàm để lấy danh sách thông báo
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
    { name: 'data-storage' }
  )
);

export default useDataStore;