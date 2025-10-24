import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DashboardPage.css';
import { Category, Macro, Announcement } from '../../types';
import BroadcastBanner from '../components/BroadcastBanner';
import HighlightText from '../components/HighlightText';
import InteractiveGuide from '../components/InteractiveGuide';

interface DashboardPageProps {
  categories: Category[];
  macros: Macro[];
  announcements: Announcement[];
}

const ONBOARDING_KEY = 'macroSystemHasVisited';

function DashboardPage({ categories, macros, announcements }: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [runTour, setRunTour] = useState(false);

useEffect(() => {
    const hasVisited = localStorage.getItem(ONBOARDING_KEY);
    let tourTimeout: NodeJS.Timeout; // Lưu trữ ID của setTimeout

    if (!hasVisited) {
      tourTimeout = setTimeout(() => {
        setRunTour(true);
      }, 1500); 
    }

    // --- BỔ SUNG HÀM CLEANUP CỦA useEffect ---
    // Hàm return này sẽ tự động chạy khi component DashboardPage
    // bị gỡ bỏ (ví dụ: khi chuyển sang trang khác).
    return () => {
      // Xóa setTimeout nếu nó chưa kịp chạy
      if (tourTimeout) {
        clearTimeout(tourTimeout);
      }
      
      // Đây là phần quan trọng nhất:
      // Chủ động gỡ khóa cuộn của body NẾU nó đang bị khóa
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
    };
    // --- KẾT THÚC BỔ SUNG ---
  }, []); // [] đảm bảo nó chỉ chạy 1 lần khi mount và cleanup 1 lần khi unmount

  const handleTourEnd = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setRunTour(false);
    
    // Vẫn giữ logic dọn dẹp ở đây để xử lý khi người dùng
    // chủ động bấm "Skip" hoặc "Finished"
    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
  };

  const getMacroCount = (categoryName: string) => {
    return macros.filter(macro => macro.category === categoryName).length;
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const colorClasses = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];
  const latestAnnouncement = announcements.length > 0 ? announcements[0] : undefined;

  return (
    <div className="dashboard-container">
      <InteractiveGuide run={runTour} onTourEnd={handleTourEnd} />

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
          />
          <button>🔍</button>
        </div>

        <h2 className="category-title">Danh mục ({filteredCategories.length})</h2>
        
        <div id="tour-category-grid" className="category-grid">
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