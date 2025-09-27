import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './DashboardPage.css';
import { Category, Macro, Announcement } from '../../types';
import BroadcastBanner from '../components/BroadcastBanner';
import HighlightText from '../components/HighlightText';

interface DashboardPageProps {
  categories: Category[];
  macros: Macro[];
  announcements: Announcement[];
}

function DashboardPage({ categories, macros, announcements }: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

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
      <main className="page-container">
        <BroadcastBanner announcement={latestAnnouncement} />

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

