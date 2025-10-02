import React from 'react';
import toast from 'react-hot-toast';
import { Descendant } from 'slate';
import { serializeSlate } from '../../utils/slateUtils';
import './CopyButtons.css';

interface CopyButtonsProps {
  content: Descendant[];
}

const CopyButtons = ({ content }: CopyButtonsProps) => {
  const handleCopy = (mode: 'default' | 'anh' | 'chi') => {
    let textToCopy = serializeSlate(content);

    // SỬA LỖI: Xử lý riêng biệt cho trường hợp viết hoa và viết thường
// SỬA LỖI: Xử lý riêng biệt cho trường hợp viết hoa và viết thường
if (mode === 'anh') {
  textToCopy = textToCopy
    .replace(/Anh\/Chị/g, 'Anh')   // Trường hợp gốc
    .replace(/anh\/chị/g, 'anh')   // Trường hợp gốc
    .replace(/Anh\/chị/g, 'Anh')   // Bổ sung theo yêu cầu
    .replace(/ANh\/Chị/g, 'Anh');  // Bổ sung theo yêu cầu
    .replace(/ANH\/CHỊ/g, 'Anh');  // Bổ sung theo yêu cầu  
} else if (mode === 'chi') {
  textToCopy = textToCopy
    .replace(/Anh\/Chị/g, 'Chị')   // Trường hợp gốc
    .replace(/anh\/chị/g, 'chị')   // Trường hợp gốc
    .replace(/Anh\/chị/g, 'Chị')   // Bổ sung theo yêu cầu
    .replace(/ANh\/Chị/g, 'Chị');  // Bổ sung theo yêu cầu
    .replace(/ANH\/CHỊ/g, 'Chị');  // Bổ sung theo yêu cầu
}

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success('Đã sao chép vào bộ nhớ tạm!');
    }).catch(err => {
      toast.error('Sao chép thất bại!');
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="copy-buttons-container">
      <button onClick={() => handleCopy('default')}>Sao chép (Anh/Chị)</button>
      <button onClick={() => handleCopy('anh')}>Sao chép (Anh)</button>
      <button onClick={() => handleCopy('chi')}>Sao chép (Chị)</button>
    </div>
  );
};

export default CopyButtons;