import React from 'react';
import Joyride, { Step, CallBackProps } from 'react-joyride';

interface InteractiveGuideProps {
  run: boolean;
  onTourEnd: () => void;
}

const InteractiveGuide = ({ run, onTourEnd }: InteractiveGuideProps) => {
  // Định nghĩa các bước hướng dẫn
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
      target: '#tour-editor-button',
      content: 'Nút này mở ra một trình soạn thảo văn bản nhanh, giúp bạn nháp nội dung trước khi gửi cho khách hàng.',
      placement: 'left',
    },
    {
      target: '#tour-ai-chat',
      content: 'Đây là trợ lý AI. Bạn có thể hỏi đáp nhanh hoặc nhờ AI tối ưu hóa câu trả lời cho khách hàng.',
      placement: 'left',
    },
    {
      target: '#tour-contribute-link',
      content: 'Cuối cùng, nếu bạn có một macro hay và muốn chia sẻ, hãy nhấn vào đây để đóng góp cho hệ thống của chúng ta nhé!',
      placement: 'bottom',
    }
  ];

  // Xử lý khi tour kết thúc (hoàn thành hoặc bỏ qua)
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
      styles={{
        options: {
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          primaryColor: '#007bff',
          textColor: '#333333',
          zIndex: 10000,
        },
      }}
    />
  );
};

export default InteractiveGuide;