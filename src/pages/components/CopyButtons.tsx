import React from 'react';
import toast from 'react-hot-toast';
import { Descendant } from 'slate';
import { serializeSlate } from '../../utils/slateUtils';
import './CopyButtons.css';
import { Macro } from '../../types'; // Import kiểu Macro
import useAuthStore from '../../stores/useAuthStore'; // Import useAuthStore

// Mở rộng Props để nhận thêm các thuộc tính và hàm cho chức năng dịch
interface CopyButtonsProps {
  content: Descendant[];
  macro: Macro; // Cần cả đối tượng macro để truyền cho hàm dịch
  isTranslated: boolean;
  isLoading: boolean;
  handleTranslate: (macro: Macro) => void;
  hideTranslation: (macroId: string) => void;
}

const CopyButtons = ({
  content,
  macro,
  isTranslated,
  isLoading,
  handleTranslate,
  hideTranslation,
}: CopyButtonsProps) => {
  const { token } = useAuthStore(); // Lấy token từ store

  const handleCopy = (mode: 'default' | 'anh' | 'chi') => {
    let textToCopy = serializeSlate(content);

    // Xử lý thay thế "Anh/Chị"
    if (mode === 'anh') {
      textToCopy = textToCopy.replace(/Anh\/Chị/gi, 'Anh').replace(/anh\/chị/gi, 'anh');
    } else if (mode === 'chi') {
      textToCopy = textToCopy.replace(/Anh\/Chị/gi, 'Chị').replace(/anh\/chị/gi, 'chị');
    }

navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success('Đã sao chép vào bộ nhớ tạm!');
      if (macro._id && token) {
        fetch(`/api/macros/${macro._id}/increment-usage`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    }).catch(err => {
      toast.error('Sao chép thất bại!');
      console.error('Không thể sao chép: ', err);
    });
  };

  return (
    <div className="copy-buttons-container">
      {/* Nhóm các nút sao chép sang bên trái */}
      <div className="copy-group">
        <button onClick={() => handleCopy('default')}>Sao chép</button>
        <button onClick={() => handleCopy('anh')}>Sao chép (Anh)</button>
        <button onClick={() => handleCopy('chi')}>Sao chép (Chị)</button>
      </div>

      {/* Nút dịch được đặt ở đây, CSS sẽ đẩy nó sang phải */}
      <div className="translation-controls">
        {isTranslated ? (
          <button onClick={() => hideTranslation(macro._id!)} className="translate-btn">
            Ẩn bản dịch
          </button>
        ) : (
          <button onClick={() => handleTranslate(macro)} disabled={isLoading} className="translate-btn">
            {isLoading ? 'Đang dịch...' : 'Dịch sang Tiếng Anh'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CopyButtons;