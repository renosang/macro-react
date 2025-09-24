import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

const ProtectedRoute = () => {
  const { isAuthenticated, _hasHydrated } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    _hasHydrated: state._hasHydrated,
  }));

  // Nếu store chưa nạp xong dữ liệu từ localStorage, không render gì cả
  // để tránh bị chuyển hướng về trang login một cách không mong muốn
  if (!_hasHydrated) {
    return null; // Hoặc bạn có thể hiển thị một component loading tại đây
  }

  // Nếu đã nạp xong và đã xác thực, cho phép truy cập. Ngược lại, chuyển hướng.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

