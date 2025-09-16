import React, { useState, useMemo } from 'react'; // Bổ sung useState và useMemo
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './DashboardPage.css';
import { Category, Macro } from '../../App';
import HighlightText from '../components/HighlightText'; // Import component mới

interface DashboardPageProps {
  categories: Category[];
  macros: Macro[];
}

function DashboardPage({ categories, macros }: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState(''); // State cho từ khóa tìm kiếm

  // Logic lọc danh mục dựa trên searchQuery
  const filteredCategories = useMemo(() => {
    if (!searchQuery) {
      return categories;
    }
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const getMacroCount = (categoryName: string) => {
    return macros.filter(macro => macro.category === categoryName).length;
  };

  const colorClasses = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];

  return (
    <div className="dashboard-container">
      <Header />
      <main className="page-container">
        <h1 className="main-title">Hệ thống tra cứu macro tư vấn</h1>
        <p className="main-description">Nhanh chóng tìm kiếm các macro và tài liệu cần thiết cho công việc của bạn.</p>
        
        <div className="search-bar-container">
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button>🔍</button>
        </div>

        <h2 className="category-title">Danh mục ({filteredCategories.length})</h2>
        
        <div className="category-grid">
          {filteredCategories.map((category, index) => {
            const macroCount = getMacroCount(category.name);
            const colorClass = colorClasses[index % colorClasses.length];

            return (
              <Link 
                key={category.id} 
                to={`/dashboard/category/${encodeURIComponent(category.name)}`} 
                className={`category-card ${colorClass}`}
              >
                <span className="category-name">
                  {/* Dùng component HighlightText để hiển thị tên */}
                  <HighlightText text={category.name} highlight={searchQuery} />
                </span>
                <span className="macro-count">({macroCount} sản phẩm)</span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;