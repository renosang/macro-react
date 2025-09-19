// src/stores/useDataStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Macro } from '../types';

const initialCategories: Category[] = [
  { id: 1, name: 'Hướng dẫn sử dụng' },
  { id: 2, name: 'Chính sách bảo hành' },
  { id: 3, name: 'Câu hỏi thường gặp' },
];
const initialMacros: Macro[] = [
  { id: 1, title: 'Hướng dẫn cài đặt phần mềm', category: 'Hướng dẫn sử dụng', content: [{ type: 'paragraph', children: [{ text: 'Nội dung...' }] }] },
  { id: 2, title: 'Quy định đổi trả hàng', category: 'Chính sách bảo hành', content: [{ type: 'paragraph', children: [{ text: 'Nội dung...' }] }] },
];

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