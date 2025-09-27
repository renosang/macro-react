import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import useUIStore from '../../stores/useUIStore';
import './Header.css';

function Header() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  // State để quản lý menu người dùng trên mobile
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Hiển thị nút hamburger cho sidebar chính
  const showSidebarHamburger = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Logic để đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);


  return (
    <header className="header">
      <div className="header-left">
        <Link to="/dashboard" className="header-logo-link">
          <img src="/logo.png" alt="Logo" className="header-logo" />
        </Link>
      </div>
      <div className="header-right">
        <span className="user-greeting">
          Xin chào, Chúc bạn làm việc hiệu quả ❤️!
        </span>
        
        {/* Các nút hiển thị trên desktop */}
        <div className="desktop-actions">
            <Link to="/dashboard/contribute" className="contribute-btn">Đóng góp</Link>
          <button onClick={handleLogout} className="logout-btn">
            Đăng xuất
          </button>
        </div>

        {/* Menu người dùng cho mobile */}
        <div className="mobile-actions" ref={menuRef}>
          <button className="hamburger-btn user-menu-toggle" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
            {/* Icon menu người dùng (3 chấm) */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>

          {isUserMenuOpen && (
            <div className="user-menu-dropdown">
                <Link to="/dashboard/contribute" onClick={() => setIsUserMenuOpen(false)}>Đóng góp Macro</Link>
              <button onClick={handleLogout}>Đăng xuất</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;