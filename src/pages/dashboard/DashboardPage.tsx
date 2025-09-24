import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './DashboardPage.css';
import { Category, Macro, Announcement } from '../../types';
import BroadcastBanner from '../components/BroadcastBanner';
import HighlightText from '../components/HighlightText'; // <-- 1. Import component HighlightText

interface DashboardPageProps {
  categories: Category[];
  macros: Macro[];
  announcements: Announcement[];
}

function DashboardPage({ categories, macros, announcements }: DashboardPageProps) {
  // 2. Thêm state để lưu trữ giá trị của thanh tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');

  const getMacroCount = (categoryName: string) => {
    return macros.filter(macro => macro.category === categoryName).length;
  };

  // 3. Lọc danh sách danh mục dựa trên searchQuery
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories; // Nếu không có gì trong ô tìm kiếm, hiển thị tất cả
    }
    // Trả về các danh mục có tên chứa từ khóa tìm kiếm (không phân biệt hoa thường)
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);


  const colorClasses = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];
  const latestAnnouncement = announcements.length > 0 ? announcements[0] : undefined;

  return (
    <div className="dashboard-container">
      <Header />
      <main className="page-container">
        <BroadcastBanner announcement={latestAnnouncement} />

        <h1 className="main-title">Hệ thống tra cứu macro tư vấn</h1>
        <p className="main-description">Nhanh chóng tìm kiếm các macro và tài liệu cần thiết cho công việc của bạn.</p>
        
        {/* 4. Cập nhật thanh tìm kiếm để kiểm soát state */}
        <div className="search-bar-container">
          <input 
            type="text" 
            placeholder="Tìm kiếm trong tất cả danh mục..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button>🔍</button>
        </div>

        <h2 className="category-title">Danh mục ({filteredCategories.length})</h2>
        
        <div className="category-grid">
          {/* 5. Sử dụng danh sách đã lọc và component HighlightText */}
          {filteredCategories.map((category, index) => {
            const macroCount = getMacroCount(category.name);
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

