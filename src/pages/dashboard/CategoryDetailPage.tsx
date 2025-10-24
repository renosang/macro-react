import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Macro } from '../../types';
import './CategoryDetailPage.css';
import HighlightText from '../components/HighlightText';
import ContentViewer from '../components/ContentViewer';
import CopyButtons from '../components/CopyButtons';
import { serializeSlate } from '../../utils/slateUtils';
import { Descendant } from 'slate';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/useAuthStore';
// Xóa HiOutlineTag
import { HiOutlineClock, HiOutlineLightBulb } from 'react-icons/hi2'; 

const IconClock = HiOutlineClock as React.ElementType;
const IconFeedback = HiOutlineLightBulb as React.ElementType;

function CategoryDetailPage({ allMacros }: { allMacros: Macro[] }) {
  const { categoryName } = useParams<{ categoryName: string }>();
  const decodedCategoryName = categoryName ? decodeURIComponent(categoryName) : '';
  const [searchQuery, setSearchQuery] = useState('');

  const [translations, setTranslations] = useState<Record<string, { content: Descendant[] }>>({});
  const [loadingTranslationId, setLoadingTranslationId] = useState<string | null>(null);
  const { token, user } = useAuthStore(); 

  const [showFeedbackModal, setShowFeedbackModal] = useState<string | null>(null); 
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const macrosInCategory = useMemo(() =>
    allMacros.filter(macro => macro.category === decodedCategoryName),
    [allMacros, decodedCategoryName]
  );

  const filteredMacros = useMemo(() => {
    if (!searchQuery.trim()) {
      return macrosInCategory;
    }
    const query = searchQuery.toLowerCase();
    return macrosInCategory.filter(macro =>
      macro.title.toLowerCase().includes(query) ||
      serializeSlate(macro.content).toLowerCase().includes(query)
    );
  }, [macrosInCategory, searchQuery]);

  // Hàm định dạng ngày giờ
  const formatDateTime = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };


  const handleTranslate = async (macro: Macro) => {
      // ... (code xử lý dịch giữ nguyên)
      if (!macro._id || !token) {
        toast.error('Bạn cần đăng nhập để sử dụng chức năng này.');
        return;
      }

      setLoadingTranslationId(macro._id);
      try {
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: macro.content, targetLang: 'en' }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'API dịch thuật gặp lỗi.');
        }

        const data = await res.json();
        const translatedContentSlate = data.translation;

        setTranslations(prev => ({
          ...prev,
          [macro._id!]: { content: translatedContentSlate }
        }));
      } catch (error: any) {
        toast.error(`Dịch thất bại: ${error.message}`);
      } finally {
        setLoadingTranslationId(null);
      }
  };

  const hideTranslation = (macroId: string) => {
      // ... (code xử lý ẩn dịch giữ nguyên)
      setTranslations(prev => {
        const newTranslations = { ...prev };
        delete newTranslations[macroId];
        return newTranslations;
      });
  };

  const handleCopyOnSelect = () => {
      // ... (code xử lý copy giữ nguyên)
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 1) {
          const selectedText = selection.toString();
          navigator.clipboard.writeText(selectedText)
              .then(() => {
                  toast.success('Đã sao chép vào bộ nhớ tạm!');
              })
              .catch(err => {
                  console.error('Lỗi sao chép tự động:', err);
              });
      }
  };

  // --- HÀM MỞ/ĐÓNG MODAL FEEDBACK ---
  const openFeedbackModal = (macroId: string) => {
      setShowFeedbackModal(macroId);
      setFeedbackContent(''); // Reset nội dung khi mở
  };

  const closeFeedbackModal = () => {
      setShowFeedbackModal(null);
      setFeedbackContent('');
  };

  // --- HÀM GỬI FEEDBACK ---
  const handleSubmitFeedback = async () => {
      if (!feedbackContent.trim() || !showFeedbackModal || !token || !user) {
          toast.error('Vui lòng nhập nội dung góp ý.');
          return;
      }
      setIsSubmittingFeedback(true);
      try {
          const res = await fetch('/api/feedback', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                  macroId: showFeedbackModal,
                  content: feedbackContent
              }),
          });
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.message || 'Gửi góp ý thất bại.');
          }
          toast.success('Cảm ơn bạn đã góp ý!');
          closeFeedbackModal();
      } catch (error: any) {
          toast.error(`Lỗi: ${error.message}`);
      } finally {
          setIsSubmittingFeedback(false);
      }
  };

  return (
    <div className="category-detail-container">
      <main className="page-container">
        <div className="breadcrumb">
          <Link to="/dashboard">Dashboard</Link> &gt; {decodedCategoryName}
        </div>
        <h1>{decodedCategoryName}</h1>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder={`Tìm kiếm trong danh mục ${decodedCategoryName}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="macro-list">
          {filteredMacros.length > 0 ? (
            filteredMacros.map((macro, index) => {
              const colorClasses = ['macro-color-1', 'macro-color-2', 'macro-color-3', 'macro-color-4', 'macro-color-5'];
              const colorClass = colorClasses[index % colorClasses.length];
              const isTranslated = macro._id && translations[macro._id];
              const isLoadingTranslation = loadingTranslationId === macro._id;

 return (
                <div key={macro._id} className={`macro-item ${colorClass}`}>
                  <div className="macro-header">
                    {/* --- CẬP NHẬT CẤU TRÚC --- */}
                    <div className="macro-header-main">
                        {/* Di chuyển icon lên trước <h3> */}
                        <div className="platform-icons-wrapper">
                          {macro.platformTags?.shopee && <img src={`${process.env.PUBLIC_URL}/logo-shopee.png`} alt="Shopee" title="Shopee" className="platform-icon-img" />}
                          {macro.platformTags?.lazada && <img src={`${process.env.PUBLIC_URL}/logo-lazada.png`} alt="Lazada" title="Lazada" className="platform-icon-img" />}
                          {macro.platformTags?.tiktok && <img src={`${process.env.PUBLIC_URL}/logo-tiktok.png`} alt="Tiktok" title="Tiktok" className="platform-icon-img" />}
                          {macro.platformTags?.hasBrand && <img src={`${process.env.PUBLIC_URL}/logo-brand.png`} alt="Brand" title="Chứa tên Brand" className="platform-icon-img brand" />}
                        </div>
                        <h3>
                          <HighlightText text={macro.title} highlight={searchQuery} />
                        </h3>
                    </div>
                    {/* --- KẾT THÚC CẬP NHẬT CẤU TRÚC --- */}
                    
                    {/* Meta section with time and feedback button */}
                    <div className="macro-header-meta">
                        <small className="last-updated">
                           <IconClock /> Cập nhật: {formatDateTime(macro.updatedAt)}
                        </small>
                        <button className="feedback-btn-header" onClick={() => openFeedbackModal(macro._id!)} title="Góp ý cho macro này">
                            <IconFeedback /> Góp ý
                        </button>
                    </div>
                  </div>

                  <div className="macro-content-body" onMouseUp={handleCopyOnSelect}>
                    <ContentViewer content={macro.content} highlight={searchQuery} />
                  </div>

                  {isTranslated && (
                    <div className="translated-content" onMouseUp={handleCopyOnSelect}>
                      <h4>Bản dịch (Tiếng Anh)</h4>
                      <ContentViewer content={translations[macro._id!].content} />
                    </div>
                  )}

                  {/* Thanh actions footer mới */}
                  <div className="macro-actions-footer">
                      <CopyButtons
                          content={macro.content}
                          macro={macro}
                          isTranslated={!!isTranslated}
                          isLoading={isLoadingTranslation}
                          handleTranslate={handleTranslate}
                          hideTranslation={hideTranslation}
                      />
                  </div>
                </div>
              );
            })
          ) : (
            <p>Không tìm thấy macro nào phù hợp với từ khóa của bạn.</p>
          )}
        </div>
      </main>

      {/* --- MODAL FEEDBACK --- */}
      {showFeedbackModal && (
        <div className="feedback-modal-backdrop" onClick={closeFeedbackModal}>
          <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Góp ý cho Macro</h3>
            <textarea
              placeholder="Nhập nội dung góp ý của bạn (ví dụ: thông tin cần cập nhật, lỗi chính tả...)"
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              rows={5}
            />
            <div className="feedback-modal-actions">
              <button onClick={closeFeedbackModal} disabled={isSubmittingFeedback}>Hủy</button>
              <button onClick={handleSubmitFeedback} disabled={isSubmittingFeedback || !feedbackContent.trim()}>
                {isSubmittingFeedback ? 'Đang gửi...' : 'Gửi góp ý'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryDetailPage;