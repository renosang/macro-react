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

    // SỬA LỖI: Thêm cờ "i" vào regex để không phân biệt hoa/thường
    if (mode === 'anh') {
      textToCopy = textToCopy.replace(/Anh\/Chị/gi, 'Anh');
    } else if (mode === 'chi') {
      textToCopy = textToCopy.replace(/Anh\/Chị/gi, 'Chị');
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