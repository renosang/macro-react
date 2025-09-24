import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header'; // Header được đặt ở đây
import EditorPopup from '../components/EditorPopup';
import FloatingEditorButton from '../components/FloatingEditorButton';

const DashboardLayout: React.FC = () => {
  return (
    <div>
      <Header />
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
      
      <FloatingEditorButton />
      
      <EditorPopup />
    </div>
  );
};

export default DashboardLayout;

