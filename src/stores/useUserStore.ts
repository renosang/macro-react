import { create } from 'zustand';
import toast from 'react-hot-toast';

export type UserRole = 'admin' | 'user';
export interface User {
  id: number;
  username: string;
  role: UserRole;
  password?: string; // Mật khẩu không bao giờ được lưu vào state
}

// Dữ liệu mới truyền cho action editUser
export interface UserUpdatePayload {
  username?: string;
  role?: UserRole;
  password?: string;
}

interface UserState {
  users: User[];
  fetchUsers: () => void;
  addUser: (username: string, password: string, role: UserRole) => void;
  removeUser: (userId: number) => void;
  editUser: (userId: number, payload: UserUpdatePayload) => void;
}

const initialUsers: User[] = [
  { id: 1, username: 'admin.user', role: 'admin' },
  { id: 2, username: 'viewer.user', role: 'user' },
];

export const useUserStore = create<UserState>((set) => ({
  users: [],
  fetchUsers: () => set({ users: initialUsers }),
  
  addUser: (username, password, role) => {
    // Trong thực tế, 'password' sẽ được gửi đến API để hash
    console.log(`Đang thêm user: ${username} với mật khẩu: ${password}`);
    set((state) => ({
      users: [...state.users, { id: Date.now(), username, role }],
    }));
    toast.success(`Đã thêm thành viên "${username}"`);
  },
  
  removeUser: (userId) => {
    set((state) => ({
      users: state.users.filter((user) => user.id !== userId),
    }));
    toast.success('Đã xóa thành viên!');
  },

  editUser: (userId, payload) => {
    if (payload.password) {
      console.log(`Đang đặt lại mật khẩu cho user ID ${userId} thành: ${payload.password}`);
    }
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, ...payload } : user
      ),
    }));
    toast.success('Đã cập nhật thông tin thành viên!');
  },
}));