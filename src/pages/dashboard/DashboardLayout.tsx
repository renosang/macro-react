// src/pages/dashboard/DashboardLayout.tsx
import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import useDataStore from '../../stores/useDataStore';
import AiChatWidget from '../components/AiChatWidget';
import EditorPopup from '../components/EditorPopup';
import FloatingEditorButton from '../components/FloatingEditorButton';
import BroadcastBanner from '../components/BroadcastBanner';
import './DashboardLayout.css';

function DashboardLayout() {
  const { fetchInitialData, _hasHydrated } = useDataStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (_hasHydrated && !hasFetched.current) {
      fetchInitialData();
      hasFetched.current = true;
    }
  }, [_hasHydrated, fetchInitialData]);

  return (
    <div className="dashboard-layout">
      <Header />
      {/* Bỏ đi div.dashboard-body và Sidebar */}
      <main className="dashboard-content">
        <BroadcastBanner />
        <Outlet />
      </main>
      <FloatingEditorButton />
      <AiChatWidget />
      <EditorPopup />
    </div>
  );
}

export default DashboardLayout;