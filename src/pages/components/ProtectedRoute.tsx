import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

interface ProtectedRouteProps {
  role?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  // Sửa ở đây: Lấy `token` và `user` từ store
  const { token, user } = useAuthStore();

  // 1. Kiểm tra xem người dùng đã đăng nhập chưa (dựa vào token)
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // 2. Nếu có yêu cầu 'role' cụ thể, kiểm tra vai trò của người dùng
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" />;
  }

  // 3. Nếu đã đăng nhập và quyền hợp lệ, cho phép truy cập
  return <Outlet />;
};

export default ProtectedRoute;