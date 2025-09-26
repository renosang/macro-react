import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

const AdminRoute = () => {
  const { user } = useAuthStore();

  // Kiểm tra xem người dùng có tồn tại và có vai trò là 'admin' hay không
  if (user?.role !== 'admin') {
    // Nếu không phải admin, chuyển hướng về trang dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Nếu là admin, cho phép truy cập các trang con (nested routes)
  return <Outlet />;
};

export default AdminRoute;