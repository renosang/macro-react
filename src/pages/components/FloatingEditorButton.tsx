// src/pages/components/FloatingEditorButton.tsx
import React from 'react';
import useEditorStore from '../../stores/useEditorStore';
import './FloatingEditorButton.css';

const FloatingEditorButton: React.FC = () => {
  // Cách gọi hook mới: chỉ chọn action cần dùng
  const toggleEditor = useEditorStore((state) => state.toggleEditor);

  return (
    <button className="fab" onClick={toggleEditor} title="Mở trình soạn thảo">
      ✍️
    </button>
  );
};

export default FloatingEditorButton;