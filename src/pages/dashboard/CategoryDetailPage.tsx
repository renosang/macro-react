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

function CategoryDetailPage({ allMacros }: { allMacros: Macro[] }) {
  const { categoryName } = useParams<{ categoryName: string }>();
  const decodedCategoryName = categoryName ? decodeURIComponent(categoryName) : '';
  const [searchQuery, setSearchQuery] = useState('');

  const [translations, setTranslations] = useState<Record<string, { content: Descendant[] }>>({});
  const [loadingTranslationId, setLoadingTranslationId] = useState<string | null>(null);
  const { token } = useAuthStore();

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

  const handleTranslate = async (macro: Macro) => {
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
    setTranslations(prev => {
      const newTranslations = { ...prev };
      delete newTranslations[macroId];
      return newTranslations;
    });
  };

  // --- BỔ SUNG: HÀM TỰ ĐỘNG SAO CHÉP KHI BÔI ĐEN ---
  const handleCopyOnSelect = () => {
    const selection = window.getSelection();
    // Chỉ sao chép nếu có nội dung được chọn (lớn hơn 1 ký tự)
    if (selection && selection.toString().trim().length > 1) {
        const selectedText = selection.toString();
        navigator.clipboard.writeText(selectedText)
            .then(() => {
                toast.success('Đã sao chép vào bộ nhớ tạm!');
            })
            .catch(err => {
                // Có thể bỏ qua toast lỗi để không làm phiền người dùng
                console.error('Lỗi sao chép tự động:', err);
            });
    }
  };
  // --- KẾT THÚC BỔ SUNG ---

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
              const isLoading = loadingTranslationId === macro._id;

              return (
                <div key={macro._id} className={`macro-item ${colorClass}`}>
                  <h3>
                    <HighlightText text={macro.title} highlight={searchQuery} />
                  </h3>
                  
                  {/* --- THÊM SỰ KIỆN onMouseUp VÀO ĐÂY --- */}
                  <div className="macro-content-body" onMouseUp={handleCopyOnSelect}>
                    <ContentViewer content={macro.content} highlight={searchQuery} />
                  </div>
                  
                  {isTranslated && (
                    // --- VÀ CẢ VÀO KHU VỰC BẢN DỊCH ---
                    <div className="translated-content" onMouseUp={handleCopyOnSelect}>
                      <h4>Bản dịch (Tiếng Anh)</h4>
                      <ContentViewer content={translations[macro._id!].content} />
                    </div>
                  )}

                  <CopyButtons
                    content={macro.content}
                    macro={macro}
                    isTranslated={!!isTranslated}
                    isLoading={isLoading}
                    handleTranslate={handleTranslate}
                    hideTranslation={hideTranslation}
                  />
                </div>
              );
            })
          ) : (
            <p>Không tìm thấy macro nào phù hợp với từ khóa của bạn.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default CategoryDetailPage;