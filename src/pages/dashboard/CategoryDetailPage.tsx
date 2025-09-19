import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
// import { Descendant } from 'slate'; // <-- SỬA LỖI Ở ĐÂY: Dòng này đã bị xóa/comment đi
import Header from '../components/Header';
import { Macro } from '../../App';
import './CategoryDetailPage.css';
import HighlightText from '../components/HighlightText';
import ContentViewer from '../components/ContentViewer';
import CopyButtons from '../components/CopyButtons';
import { serializeSlate } from '../../utils/slateUtils';

function CategoryDetailPage({ allMacros }: { allMacros: Macro[] }) {
  const { categoryName } = useParams<{ categoryName: string }>();
  const decodedCategoryName = categoryName ? decodeURIComponent(categoryName) : '';
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="category-detail-container">
      <Header />
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
          <button>🔍</button>
        </div>
        <div className="macro-list">
          {filteredMacros.length > 0 ? (
            filteredMacros.map((macro, index) => {
              const colorClasses = ['macro-color-1', 'macro-color-2', 'macro-color-3', 'macro-color-4', 'macro-color-5'];
              const colorClass = colorClasses[index % colorClasses.length];

              return (
                <div key={macro.id} className={`macro-item ${colorClass}`}>
                  <h3>
                    <HighlightText text={macro.title} highlight={searchQuery} />
                  </h3>
                  <div className="macro-content-body">
                    <ContentViewer content={macro.content} highlight={searchQuery} />
                    <CopyButtons content={macro.content} />
                  </div>
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