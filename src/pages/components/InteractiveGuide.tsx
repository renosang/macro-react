import React from 'react';
import Joyride, { Step, CallBackProps } from 'react-joyride';

interface InteractiveGuideProps {
  run: boolean;
  onTourEnd: () => void;
}

const InteractiveGuide = ({ run, onTourEnd }: InteractiveGuideProps) => {
  // --- CẬP NHẬT CÁC BƯỚC HƯỚNG DẪN ---
  const steps: Step[] = [
    {
      target: '#tour-search-bar',
      content: 'Đây là thanh tìm kiếm. Bạn có thể gõ vào đây để tra cứu nhanh các danh mục.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-category-grid',
      content: 'Khu vực này hiển thị tất cả các danh mục. Hãy nhấn vào một danh mục để xem nội dung chi tiết bên trong.',
      placement: 'top',
    },
    {
      // Gộp chung bước Soạn thảo và AI
      target: '#tour-ai-chat', 
      content: 'Khu vực này là các công cụ hỗ trợ nhanh, bao gồm Trợ lý AI và nút Soạn thảo nhanh (✍️) để bạn ghi chú.',
      placement: 'left',
    },
    {
      target: '#tour-main-menu',
      content: 'Cuối cùng, hãy nhấn vào đây để khám phá thêm các tính năng khác như "Quản lý liên kết", "Tác vụ", hoặc "Đóng góp" nhé!',
      placement: 'bottom',
    }
  ];
  // --- KẾT THÚC CẬP NHẬT BƯỚC ---

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
      onTourEnd();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      locale={{
        back: 'Quay lại',
        close: 'Đóng',
        last: 'Hoàn thành',
        next: 'Tiếp theo',
        skip: 'Bỏ qua',
      }}
      // --- CẬP NHẬT CSS CHUYÊN NGHIỆP HƠN ---
      styles={{
        options: {
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          primaryColor: '#007bff',
          textColor: '#333333',
          zIndex: 10000,
        },
        tooltip: {
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          padding: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        },
        tooltipContent: {
          fontSize: '15px',
          lineHeight: '1.6',
          padding: '5px 0 0 0',
        },
        buttonClose: {
          color: '#888',
        },
        buttonNext: {
          fontSize: '14px',
          padding: '10px 15px',
          borderRadius: '8px',
        },
        buttonBack: {
          fontSize: '14px',
          padding: '10px 15px',
          borderRadius: '8px',
          marginRight: 'auto',
        },
        buttonSkip: {
          fontSize: '14px',
          color: '#555',
        },
      }}
      // --- KẾT THÚC CẬP NHẬT CSS ---
    />
  );
};

export default InteractiveGuide;