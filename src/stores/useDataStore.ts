import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Macro, Announcement } from '../types';

export interface DataState {
  categories: Category[];
  macros: Macro[];
  announcements: Announcement[];
  dataLoaded: boolean; // Thêm trạng thái này
  fetchCategories: () => Promise<void>;
  fetchMacros: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  setMacros: (macros: Macro[]) => void;
}

const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({ // Sử dụng get để truy cập state hiện tại
      categories: [],
      macros: [],
      announcements: [],
      dataLoaded: false, // Giá trị khởi tạo

      fetchCategories: async () => {
        // Chỉ fetch nếu dataLoaded là false
        if (get().dataLoaded) return;
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
        if (get().dataLoaded) return;
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
        if (get().dataLoaded) return;
        try {
            const response = await fetch('/api/announcements');
            if (!response.ok) throw new Error('Failed to fetch announcements');
            const data = await response.json();
            // Sau khi fetch thành công lần đầu, đánh dấu là đã load
            set({ announcements: data, dataLoaded: true }); 
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
      },

      setMacros: (newMacros) => set({ macros: newMacros }),
    }),
    { 
      name: 'data-storage',
      // Khi người dùng logout và login lại, bạn có thể muốn reset trạng thái dataLoaded
      // Bằng cách xóa item này khỏi localStorage khi logout.
    }
  )
);

export default useDataStore;