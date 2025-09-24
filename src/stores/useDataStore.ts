import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Macro } from '../types';

// Dữ liệu khởi tạo không còn cần thiết và được thay bằng mảng rỗng
// để tránh lỗi kiểu dữ liệu. Dữ liệu thực sẽ được fetch từ API.
const initialCategories: Category[] = [];
const initialMacros: Macro[] = [];

export interface DataState {
  categories: Category[];
  macros: Macro[];
  setCategories: (categories: Category[]) => void;
  setMacros: (macros: Macro[]) => void;
}

const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      categories: initialCategories,
      macros: initialMacros,
      setCategories: (newCategories) => set({ categories: newCategories }),
      setMacros: (newMacros) => set({ macros: newMacros }),
    }),
    { name: 'data-storage' }
  )
);

export default useDataStore;
