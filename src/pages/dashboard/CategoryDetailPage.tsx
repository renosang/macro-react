import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Macro, Category } from '../../types';
import './CategoryDetailPage.css';
import HighlightText from '../components/HighlightText';
import ContentViewer from '../components/ContentViewer';
import CopyButtons from '../components/CopyButtons';
import { serializeSlate } from '../../utils/slateUtils';
import { Descendant } from 'slate';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/useAuthStore';
import { HiOutlineClock, HiOutlineLightBulb, HiMagnifyingGlass } from 'react-icons/hi2'; 

const IconClock = HiOutlineClock as React.ElementType;
const IconFeedback = HiOutlineLightBulb as React.ElementType;
const IconSearch = HiMagnifyingGlass as React.ElementType;

interface CategoryDetailPageProps {
  allMacros: Macro[];
  allCategories: Category[]; 
}

const findCategoryAndChildren = (categories: Category[], categoryName: string): { currentCategory: Category | null; children: Category[] } => {
  let currentCategory: Category | null = null;
  let children: Category[] = [];

  const findInChildren = (cats: Category[]): boolean => {
    if (!cats) return false; 
    for (const cat of cats) {
      if (cat.name === categoryName) {
        currentCategory = cat;
        children = cat.children || [];
        return true;
      }
      if (cat.children && findInChildren(cat.children)) {
        return true;
      }
    }
    return false;
  };

  findInChildren(categories);
  return { currentCategory, children };
};


function CategoryDetailPage({ allMacros, allCategories }: CategoryDetailPageProps) { 
  const { categoryName } = useParams<{ categoryName: string }>();
  const decodedCategoryName = categoryName ? decodeURIComponent(categoryName) : '';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all'); 
  const [translations, setTranslations] = useState<Record<string, { content: Descendant[] }>>({});
  const [loadingTranslationId, setLoadingTranslationId] = useState<string | null>(null);
  const { token, user } = useAuthStore();
  const [showFeedbackModal, setShowFeedbackModal] = useState<string | null>(null);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); 

  const { currentCategory, children: subCategories } = useMemo(() => {
    return findCategoryAndChildren(allCategories, decodedCategoryName);
  }, [allCategories, decodedCategoryName]);

  useEffect(() => {
    setSelectedSubCategory('all');
  }, [decodedCategoryName]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const macrosInCategory = useMemo(() => {
    if (!currentCategory) return []; 

    const targetCategoryIds: string[] = [currentCategory._id];

    const getChildIds = (cats: Category[]): string[] => {
      let ids: string[] = [];
      cats.forEach(cat => {
        ids.push(cat._id);
        if (cat.children && cat.children.length > 0) {
          ids = ids.concat(getChildIds(cat.children));
        }
      });
      return ids;
    };
    
    targetCategoryIds.push(...getChildIds(subCategories));
    
    return allMacros.filter(macro => 
      macro.category && (typeof macro.category === 'object') && targetCategoryIds.includes(macro.category._id)
    );
  }, [allMacros, currentCategory, subCategories]);


  const filteredMacros = useMemo(() => {
    let tempMacros = macrosInCategory;

    if (selectedSubCategory !== 'all') {
      
      const getDescendantIds = (cats: Category[], selectedId: string): string[] => {
        let ids: string[] = [];
        const find = (categories: Category[]) => {
            if (!categories) return;
            for (const cat of categories) {
                if (cat._id === selectedId) {
                    ids.push(cat._id); 
                    const addChildren = (c: Category) => {
                        if (c.children) {
                            c.children.forEach(child => {
                                ids.push(child._id);
                                addChildren(child);
                            });
                        }
                    };
                    addChildren(cat); 
                    return; 
                }
                if (cat.children) find(cat.children); 
            }
        };
        
        find(cats); 
        
        if(ids.length === 0 && selectedId === currentCategory?._id) {
          return [currentCategory._id];
        }
        return ids;
      };
      
      const searchBase = subCategories;
      const selectedCategoryIds = getDescendantIds(searchBase, selectedSubCategory);
      
      tempMacros = tempMacros.filter(macro => 
        macro.category && (typeof macro.category === 'object') && selectedCategoryIds.includes(macro.category._id)
      );

    }
     else if (selectedSubCategory === 'all') {
     }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tempMacros = tempMacros.filter(macro =>
        macro.title.toLowerCase().includes(query) ||
        serializeSlate(macro.content).toLowerCase().includes(query)
      );
    }

    return tempMacros;
  }, [macrosInCategory, searchQuery, selectedSubCategory, subCategories, currentCategory]);

  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleTranslate = async (macro: Macro) => {
      if (!macro._id || !token) {
        toast.error('Bạn cần đăng nhập để sử dụng chức năng này.');
        return;
      }
      setLoadingTranslationId(macro._id);
      try {
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ content: macro.content, targetLang: 'en' }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'API dịch thuật gặp lỗi.');
        }
        const data = await res.json();
        setTranslations(prev => ({ ...prev, [macro._id!]: { content: data.translation } }));
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

  const handleCopyOnSelect = (macro: Macro) => {
    if (!token) return;
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 1) {
        const selectedText = selection.toString();
        navigator.clipboard.writeText(selectedText)
            .then(() => {
                toast.success('Đã sao chép vào bộ nhớ tạm!');
                if (macro._id && token) {
                  fetch(`/api/macros/${macro._id}/increment-usage`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                }
            })
            .catch(err => { console.error('Lỗi sao chép tự động:', err); });
    }
  };

   const openFeedbackModal = (macroId: string) => {
      setShowFeedbackModal(macroId);
      setFeedbackContent('');
  };

  const closeFeedbackModal = () => {
      setShowFeedbackModal(null);
      setFeedbackContent('');
  };

   const handleSubmitFeedback = async () => {
      if (!feedbackContent.trim() || !showFeedbackModal || !token || !user) {
          toast.error('Vui lòng nhập nội dung góp ý.');
          return;
      }
      setIsSubmittingFeedback(true);
      try {
          const res = await fetch('/api/feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ macroId: showFeedbackModal, content: feedbackContent }),
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

  const getSelectedCategoryText = () => {
    if (selectedSubCategory === 'all' || !currentCategory) {
      return `Tất cả trong "${decodedCategoryName}"`;
    }
    
    let foundName = `Tất cả trong "${decodedCategoryName}"`; 

    if (selectedSubCategory === currentCategory._id) {
        return decodedCategoryName;
    }

    const findName = (cats: Category[]): boolean => {
        for(const cat of cats) {
            if (cat._id === selectedSubCategory) {
                foundName = cat.name;
                return true;
            }
            if (cat.children && findName(cat.children)) return true;
        }
        return false;
    };
    
    findName(subCategories); 
    return foundName;
  };
  
  const renderDropdownOptions = (categories: Category[], level: number): React.ReactNode[] => {
    const options: React.ReactNode[] = [];
    
    categories.forEach(cat => {
      options.push(
        <li 
          key={cat._id}
          style={{ paddingLeft: `${level * 20 + 14}px` }} 
          onClick={() => {
            setSelectedSubCategory(cat._id);
            setIsDropdownOpen(false);
          }}
        >
          {level > 0 && <span className="dropdown-prefix">└─ </span>}
          {cat.name}
        </li>
      );

      if (cat.children && cat.children.length > 0) {
        options.push(...renderDropdownOptions(cat.children, level + 1));
      }
    });

    return options;
  };

  return (
    <div className="category-detail-container">
      <main className="page-container">
        <div className="breadcrumb">
          <Link to="/dashboard">Dashboard</Link> &gt; {decodedCategoryName}
        </div>
        <h1>{decodedCategoryName}</h1>

        <div className="filter-search-bar" ref={dropdownRef}>
          {subCategories && subCategories.length > 0 && (
            <div className="custom-select-container">
              <button 
                type="button" 
                className="custom-select-toggle"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {getSelectedCategoryText()}
              </button>
              {isDropdownOpen && (
                <ul className="custom-select-options">
                  <li 
                    onClick={() => {
                      setSelectedSubCategory('all');
                      setIsDropdownOpen(false);
                    }}
                  >
                    Tất cả trong "{decodedCategoryName}"
                  </li>
                  
                  {renderDropdownOptions(subCategories, 0)}                  
                </ul>
              )}
            </div>
           )}
           <div className="search-input-wrapper">
              <IconSearch className="search-icon" />
              <input
                type="text"
                placeholder={`Tìm kiếm macro...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
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
                    <div className="macro-header-main">
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
                    <div className="macro-header-meta">
                        <small className="last-updated">
                           <IconClock /> Cập nhật: {formatDateTime(macro.updatedAt)}
                        </small>
                        <button className="feedback-btn-header" onClick={() => openFeedbackModal(macro._id!)} title="Góp ý cho macro này">
                            <IconFeedback /> Góp ý
                        </button>
                    </div>
                  </div>

                  <div className="macro-content-body" onMouseUp={() => handleCopyOnSelect(macro)}>
                    <ContentViewer content={macro.content} highlight={searchQuery} />
                  </div>

                  {isTranslated && (
                    <div className="translated-content" onMouseUp={() => handleCopyOnSelect(macro)}>
                      <h4>Bản dịch (Tiếng Anh)</h4>
                      <ContentViewer content={translations[macro._id!].content} />
                    </div>
                  )}

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
             <p>Không tìm thấy macro nào phù hợp.</p>
          )}
        </div>
      </main>

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