import React from 'react';
import { Outlet } from 'react-router-dom';
import EditorPopup from '../components/EditorPopup';
import FloatingEditorButton from '../components/FloatingEditorButton';

const DashboardLayout: React.FC = () => {
  return (
    <div>
      <main style={{ padding: '20px' }}>
        {/* Đây là nơi nội dung của các trang con như DashboardPage, 
            CategoryDetailPage sẽ được hiển thị */}
        <Outlet />
      </main>
      
      {/* Nút bấm nổi sẽ luôn hiển thị ở góc màn hình */}
      <FloatingEditorButton />
      
      {/* Component popup soạn thảo, sẵn sàng để được bật lên */}
      <EditorPopup />
    </div>
  );
};

export default DashboardLayout;