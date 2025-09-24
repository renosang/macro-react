import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore'; // <-- Import useAuthStore
import './Header.css';
import companyLogo from '../../logo.png';

function Header() {
  const logout = useAuthStore((state) => state.logout); // <-- Lấy hàm logout từ store
  const navigate = useNavigate(); // <-- Dùng để điều hướng sau khi logout

  const handleLogout = () => {
    logout();
    navigate('/login'); // <-- Điều hướng về trang đăng nhập
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/dashboard" className="logo-link"> 
          <img src={companyLogo} alt="ThienTu" className="header-logo" />
        </Link>
      </div>
      <div className="header-right">
        <span>Xin chào, User!</span>
        {/* Thêm sự kiện onClick cho nút Đăng xuất */}
        <button className="logout-button" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default Header;