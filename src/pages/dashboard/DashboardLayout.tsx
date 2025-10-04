import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import useDataStore from '../../stores/useDataStore';
import AiChatWidget from '../components/AiChatWidget';
import EditorPopup from '../components/EditorPopup';
import FloatingEditorButton from '../components/FloatingEditorButton';
import BroadcastBanner from '../components/BroadcastBanner';

function DashboardLayout() {
  const { fetchInitialData, _hasHydrated } = useDataStore();
  
  // Sử dụng useRef để tạo một cờ, đảm bảo việc fetch chỉ xảy ra một lần
  const hasFetched = useRef(false);

  useEffect(() => {
    // Chỉ thực hiện logic khi:
    // 1. Quá trình hydration đã hoàn tất.
    // 2. Việc fetch chưa được thực hiện lần nào (hasFetched.current là false).
    if (_hasHydrated && !hasFetched.current) {
      fetchInitialData();
      // Đánh dấu là đã fetch để các lần render lại sau này không gọi nữa.
      hasFetched.current = true;
    }
  }, [_hasHydrated, fetchInitialData]);

  return (
    <div className="dashboard-layout">
      <Header />
      <BroadcastBanner />
      <main className="dashboard-content">
        <Outlet />
      </main>
      {/* Các component nổi sẽ luôn hiển thị ở góc màn hình */}
      <FloatingEditorButton />
      <AiChatWidget /> {/* <-- Thêm AiChatWidget để nó được render */}
      <EditorPopup />
    </div>
  );
}

export default DashboardLayout;

