// Ví dụ trong src/pages/dashboard/DashboardLayout.tsx
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import useDataStore from '../../stores/useDataStore';
import AiChatWidget from '../components/AiChatWidget'; // Giả sử bạn có component này
import BroadcastBanner from '../components/BroadcastBanner'; // Giả sử bạn có component này

function DashboardLayout() {
  const { fetchInitialData, _hasHydrated } = useDataStore();

  useEffect(() => {
    // Chỉ thực hiện logic khi quá trình hydration đã hoàn tất
    if (_hasHydrated) {
      fetchInitialData();
    }
  }, [_hasHydrated, fetchInitialData]); // Phụ thuộc vào _hasHydrated

  // Để không có độ trễ thị giác, bạn có thể hiển thị một layout trống hoặc skeleton
  // trong khi chờ hydration. Nhưng với localForage, việc này cực nhanh.
  // Thường thì bạn không cần một màn hình loading riêng cho việc này.

  return (
    <div className="dashboard-layout">
      <Header />
      <BroadcastBanner />
      <main className="dashboard-content">
        <Outlet />
      </main>
      <AiChatWidget />
    </div>
  );
}

export default DashboardLayout;