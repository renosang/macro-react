// src/pages/dashboard/DashboardLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import AiChatWidget from '../components/AiChatWidget';
import EditorPopup from '../components/EditorPopup';
import FloatingEditorButton from '../components/FloatingEditorButton';
import BroadcastBanner from '../components/BroadcastBanner';
import './DashboardLayout.css';

function DashboardLayout() {
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