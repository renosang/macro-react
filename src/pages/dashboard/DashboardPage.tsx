import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './DashboardPage.css';
import { Category, Macro, Announcement } from '../../App';
import BroadcastBanner from '../components/BroadcastBanner';

interface DashboardPageProps {
  categories: Category[];
  macros: Macro[];
  announcements: Announcement[];
}

function DashboardPage({ categories, macros, announcements }: DashboardPageProps) {
  
  const getMacroCount = (categoryName: string) => {
    return macros.filter(macro => macro.category === categoryName).length;
  };

  const colorClasses = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];
  const latestAnnouncement = announcements.length > 0 ? announcements[0] : undefined;

  return (
    <div className="dashboard-container">
      <Header />
      <main className="page-container">
        <BroadcastBanner announcement={latestAnnouncement} />

        <h1 className="main-title">Hệ thống tra cứu macro tư vấn</h1>
        <p className="main-description">Nhanh chóng tìm kiếm các macro và tài liệu cần thiết cho công việc của bạn.</p>
        
        <div className="search-bar-container">
          <input type="text" placeholder="Tìm kiếm trong tất cả danh mục..." />
          <button>🔍</button>
        </div>

        <h2 className="category-title">Danh mục ({categories.length})</h2>
        
        <div className="category-grid">
          {categories.map((category, index) => {
            const macroCount = getMacroCount(category.name);
            const colorClass = colorClasses[index % colorClasses.length];
            return (
              <Link 
                key={category.id} 
                to={`/dashboard/category/${encodeURIComponent(category.name)}`} 
                className={`category-card ${colorClass}`}
              >
                <span className="category-name">{category.name}</span>
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