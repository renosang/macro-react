// src/pages/components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import './Header.css';

// Import các icon cần thiết từ Heroicons
import {
  HiOutlineRectangleGroup,
  HiOutlineCheckBadge,
  HiOutlineQueueList,
  HiOutlineQuestionMarkCircle,
  HiOutlineCog,
  HiOutlineBars3,
  HiOutlineArrowRightOnRectangle,
  HiOutlinePencilSquare,
  HiOutlineLink
} from 'react-icons/hi2';

// Ép kiểu các icon để TypeScript hiểu đúng
const IconPortal = HiOutlineRectangleGroup as React.ElementType;
const IconCQM = HiOutlineCheckBadge as React.ElementType;
const IconBacklog = HiOutlineQueueList as React.ElementType;
const IconFAQ = HiOutlineQuestionMarkCircle as React.ElementType;
const IconAdmin = HiOutlineCog as React.ElementType;
const IconMenu = HiOutlineBars3 as React.ElementType;
const IconLogout = HiOutlineArrowRightOnRectangle as React.ElementType;
const IconContribute = HiOutlinePencilSquare as React.ElementType;
const IconLinks = HiOutlineLink as React.ElementType;


function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setIsMenuOpen(false); // Đóng menu khi đăng xuất
    logout();
    navigate('/login');
  };

  // Xử lý đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
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
        
        {/* Nút menu chính thay thế cho các nút cũ */}
        <div className="header-menu-container" ref={menuRef}>
          <button className="header-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <IconMenu />
          </button>

          {isMenuOpen && (
            <nav className="header-menu-dropdown">

              {/* Nhóm điều hướng chính */}
              <NavLink to="https://kb-portal.vercel.app/" target="_blank" end onClick={() => setIsMenuOpen(false)}>
                <IconPortal /><span>KB Portal</span>
              </NavLink>
              <NavLink to="https://onpointvn-my.sharepoint.com/:x:/r/personal/diep_truong_onpoint_vn/_layouts/15/doc2.aspx?sourcedoc=%7B811E44AC-EEB0-416E-A6CB-C3CAA957964D%7D&file=DATA%20CQM%20TTU%20-%20Ver3.2025.xlsx&fromShare=true&action=default&mobileredirect=true" target="_blank" onClick={() => setIsMenuOpen(false)}>
                 <IconCQM /><span>Sai sót chất lượng</span>
              </NavLink>
              <NavLink to="https://docs.google.com/spreadsheets/u/0/d/19luSxwI2kUt0e5gJy1QZt7EOqJxzORcTIc__gEsDHcA/htmlview#gid=0" target="_blank" onClick={() => setIsMenuOpen(false)}>
                 <IconFAQ /><span>FAQ tổng hợp</span>
              </NavLink>
              <NavLink to="https://beegadget.sg.larksuite.com/base/OF69bG6onayNSNsCc8kl2QKxgle?from=from_copylink" target="_blank" onClick={() => setIsMenuOpen(false)}>
                 <IconBacklog /><span>Kiểm tra Backlog</span>
              </NavLink>
              <NavLink to="/dashboard/links" onClick={() => setIsMenuOpen(false)}>
                <IconLinks /><span>Quản lí liên kết</span>
              </NavLink>
              <NavLink to="/dashboard/contribute" id="tour-contribute-link" onClick={() => setIsMenuOpen(false)}>
                <IconContribute /><span>Đóng góp Macro</span>
              </NavLink>
              
              <div className="dropdown-separator"></div>

              {/* Nhóm chức năng bổ sung */}
              {user?.role === 'admin' && (
                <NavLink to="/admin" onClick={() => setIsMenuOpen(false)}>
                  <IconAdmin /><span>Trang quản trị</span>
                </NavLink>
              )}

              
              <div className="dropdown-separator"></div>

              {/* Nút đăng xuất */}
              <button className="logout-menu-btn" onClick={handleLogout}>
                <IconLogout /><span>Đăng xuất</span>
              </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;