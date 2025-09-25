import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => {
        set({ user, token });
      },
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token'); // Đảm bảo token cũng được xóa khỏi localStorage
      },
    }),
    {
      name: 'auth-storage', // Tên để lưu trong localStorage
    }
  )
);

export default useAuthStore;