import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './DashboardPage.css';
import { Category, Macro, Announcement } from '../../types';
import BroadcastBanner from '../components/BroadcastBanner';
import HighlightText from '../components/HighlightText';

interface DashboardPageProps {
  categories: Category[]; // Prop này giờ là CÂY chỉ chứa danh mục cha (từ App.tsx)
  macros: Macro[];
  announcements: Announcement[];
}

// --- BỔ SUNG: Hàm đệ quy để đếm macro ---
// Đếm số macro của category hiện tại và TẤT CẢ các category con cháu của nó
const getMacroCountRecursive = (category: Category, allMacros: Macro[]): number => {
  // 1. Đếm macro của chính nó
  let count = allMacros.filter(macro => macro.category === category.name).length;
  
  // 2. Nếu có con, đếm đệ quy cho từng đứa con và cộng dồn
  if (category.children && category.children.length > 0) {
    for (const child of category.children) {
      count += getMacroCountRecursive(child, allMacros); // Đếm cả các con
    }
  }
  return count;
};
// --- KẾT THÚC BỔ SUNG ---

function DashboardPage({ categories, macros, announcements }: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // --- SỬA: Xóa hàm getMacroCount(categoryName: string) cũ ---
  // const getMacroCount = (categoryName: string) => { ... }; // XÓA HÀM NÀY

  const filteredCategories = useMemo(() => {
    // categories (prop) LÀ CÂY chỉ chứa danh mục cha (đã xử lý ở App.tsx)
    // Logic này đã đúng, nó chỉ lọc trên danh sách cha.
    if (!searchQuery.trim()) {
      return categories; // Trả về danh sách các danh mục cha
    }
    
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]); // categories ở đây là state 'categories' từ App.tsx

  const colorClasses = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];
  const latestAnnouncement = announcements.length > 0 ? announcements[0] : undefined;

  return (
    <div className="dashboard-container">
      <main className="page-container">
        <BroadcastBanner announcement={latestAnnouncement} />
        
        <h1 className="main-title">Hệ thống tra cứu macro tư vấn</h1>
        <p className="main-description">Nhanh chóng tìm kiếm các macro và tài liệu cần thiết cho công việc của bạn.</p>
        
        <div id="tour-search-bar" className="search-bar-container">
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            name="dashboard-search"
            id="dashboard-search"
          />
          <button>🔍</button>
        </div>

        {/* SỬA: Dòng này sẽ tự động chỉ đếm danh mục cha (filteredCategories.length) */}
        <h2 className="category-title">Danh mục ({filteredCategories.length})</h2>
        
        <div id="tour-category-grid" className="category-grid">
          
          {/* SỬA: filteredCategories giờ chỉ chứa danh mục cha */}
          {filteredCategories.map((category, index) => {
            
            // --- SỬA: Gọi hàm đếm đệ quy cho mỗi danh mục cha ---
            const macroCount = getMacroCountRecursive(category, macros); 
            
            const colorClass = colorClasses[index % colorClasses.length];
            return (
              <Link 
                key={category._id} 
                to={`/dashboard/category/${encodeURIComponent(category.name)}`} 
                className={`category-card ${colorClass}`}
              >
                <span className="category-name">
                   <HighlightText text={category.name} highlight={searchQuery} />
                </span>
                {/* SỬA: Hiển thị tổng số macro (bao gồm cả con) */}
                <span className="macro-count">({macroCount} Macro)</span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;