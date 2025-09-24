import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserInfo {
  username: string;
  role: 'user' | 'admin';
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserInfo | null;
  _hasHydrated: boolean; // Flag to indicate hydration is complete
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void; // Action to set the flag
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      _hasHydrated: false, // Initial value
      login: (token, user) => set({ isAuthenticated: true, token, user }),
      logout: () => set({ isAuthenticated: false, token: null, user: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    { 
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // When rehydration is done, call the action to update the flag
        state?.setHasHydrated(true);
      }
    }
  )
);

export default useAuthStore;

