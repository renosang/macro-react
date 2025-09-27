import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import './Header.css';

function Header() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  // State để quản lý menu người dùng trên mobile
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
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