import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Header from '../components/Header';
import './AdminLayout.css';

// --- THAY ĐỔI: Import bộ icon Heroicons hiện đại hơn ---
import {
  HiOutlineSquares2X2,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineMegaphone,
  HiOutlineChartBarSquare
} from 'react-icons/hi2';

// --- BỔ SUNG GIẢI PHÁP: Ép kiểu để đảm bảo tương thích TypeScript ---
const IconCategories = HiOutlineSquares2X2 as React.ElementType;
const IconMacros = HiOutlineDocumentText as React.ElementType;
const IconUsers = HiOutlineUsers as React.ElementType;
const IconAnnouncements = HiOutlineMegaphone as React.ElementType;
const IconAnalytics = HiOutlineChartBarSquare as React.ElementType;

function AdminLayout() {
  return (
    <div className="admin-layout">
      <Header />
      <div className="admin-container">
        <aside className="admin-sidebar">
          <nav>
            {/* --- CẬP NHẬT: Sử dụng các icon mới --- */}
            <NavLink to="/admin/categories" title="Quản lý Danh mục">
              <IconCategories className="nav-icon" />
              <span className="nav-text">Quản lý Danh mục</span>
            </NavLink>
            <NavLink to="/admin/macros" title="Quản lý Macro">
              <IconMacros className="nav-icon" />
              <span className="nav-text">Quản lý Macro</span>
            </NavLink>
            <NavLink to="/admin/users" title="Quản lý Thành viên">
              <IconUsers className="nav-icon" />
              <span className="nav-text">Quản lý Thành viên</span>
            </NavLink>
            <NavLink to="/admin/announcements" title="Quản lý Thông báo">
              <IconAnnouncements className="nav-icon" />
              <span className="nav-text">Quản lý Thông báo</span>
            </NavLink>
            <NavLink to="/admin/analytics" title="Phân tích">
              <IconAnalytics className="nav-icon" />
              <span className="nav-text">Phân tích</span>
            </NavLink>
          </nav>
        </aside>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;