import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import EditorPopup from '../components/EditorPopup';
import FloatingEditorButton from '../components/FloatingEditorButton';
import AiChatWidget from '../components/AiChatWidget'; // <-- Đảm bảo đã import

const DashboardLayout: React.FC = () => {
  return (
    <div>
      <Header /> {/* <-- Thêm Header vào layout chung */}
      <main>
        <Outlet /> {/* <-- Nội dung trang con sẽ hiển thị ở đây */}
      </main>
      
      {/* Các component nổi sẽ luôn hiển thị ở góc màn hình */}
      <FloatingEditorButton />
      <AiChatWidget /> {/* <-- Thêm AiChatWidget để nó được render */}
      
      <EditorPopup />
    </div>
  );
};

export default DashboardLayout;

