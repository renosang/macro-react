import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      login: (token) => set({ isAuthenticated: true, token: token }),
      logout: () => {
        // Khi logout, chúng ta cũng có thể xóa các state khác nếu cần
        // useDataStore.persist.clearStorage();
        set({ isAuthenticated: false, token: null });
      },
    }),
    {
      name: 'auth-storage', // Tên key lưu trong localStorage
    }
  )
);

export default useAuthStore;