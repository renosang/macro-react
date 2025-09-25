import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

const ProtectedRoute = () => {
  // Lấy token trực tiếp từ store
  const token = useAuthStore((state) => state.token);
  
  // Sử dụng một state riêng để theo dõi quá trình hydration của Zustand
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // onHydrateStorage trả về một hàm để hủy đăng ký listener
    const unsubscribe = useAuthStore.persist.onHydrate(() => setIsHydrated(true));

    // Kích hoạt việc kiểm tra hydration
    useAuthStore.persist.rehydrate();

    return () => {
      unsubscribe();
    };
  }, []);

  // Nếu chưa hydrate xong, hiển thị trạng thái loading để tránh việc bị redirect oan
  if (!isHydrated) {
    return <div>Loading...</div>; // Hoặc một component spinner đẹp hơn
  }

  // Nếu đã hydrate xong và có token, cho phép truy cập
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;