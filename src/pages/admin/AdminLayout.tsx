import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore'; // Import store của bạn
import './AdminLayout.css';

// Import bộ icon Heroicons v2
import {
  HiOutlineSquares2X2,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineMegaphone,
  HiOutlineChartBarSquare,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineLink
} from 'react-icons/hi2';

// Ép kiểu để đảm bảo tương thích TypeScript
const IconCategories = HiOutlineSquares2X2 as React.ElementType;
const IconMacros = HiOutlineDocumentText as React.ElementType;
const IconUsers = HiOutlineUsers as React.ElementType;
const IconAnnouncements = HiOutlineMegaphone as React.ElementType;
const IconAnalytics = HiOutlineChartBarSquare as React.ElementType;
const IconLogout = HiOutlineArrowLeftOnRectangle as React.ElementType;
const IconLinks = HiOutlineLink as React.ElementType;

function AdminLayout() {
  // --- SỬA LỖI: Lấy đúng hàm `logout` từ store ---
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // <-- Gọi hàm logout() từ store của bạn
    navigate('/login'); // Điều hướng về trang đăng nhập
  };

  return (
    <div className="admin-layout">
      <div className="admin-container">
        <aside className="admin-sidebar">
          {/* Phần trên của sidebar */}
          <div className="sidebar-top">
            <Link to="/dashboard" className="sidebar-logo">
              <img src="/logo.png" alt="Logo" />
            </Link>
            <nav>
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
              <NavLink to="/admin/links" title="Quản lý liên kết">
                <IconLinks className="nav-icon" />
                <span className="nav-text">Quản lý liên kết</span>
              </NavLink>
              <NavLink to="/admin/analytics" title="Phân tích">
                <IconAnalytics className="nav-icon" />
                <span className="nav-text">Phân tích</span>
              </NavLink>
            </nav>
          </div>

          {/* Phần dưới của sidebar (chứa nút logout) */}
          <div className="sidebar-bottom">
            <button onClick={handleLogout} className="logout-button" title="Đăng xuất">
              <IconLogout className="nav-icon" />
              <span className="nav-text">Đăng xuất</span>
            </button>
          </div>
        </aside>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;