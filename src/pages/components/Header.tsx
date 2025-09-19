import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/useAuthStore'; // <-- 1. Import store xác thực
import './Header.css';

// Import logo
import companyLogo from '../../logo.png';

const Header: React.FC = () => { // <-- 2. Thay đổi thành React.FC
  const logoutAction = useAuthStore((state) => state.logout); // <-- 3. Lấy action logout
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAction();
    toast.success('Đã đăng xuất thành công!');
    navigate('/login'); // <-- 4. Điều hướng về trang đăng nhập
  };

  return (
    <header className="app-header">
      <Link to="/dashboard" className="logo-link"> 
        <img src={companyLogo} alt="ThienTu" className="header-logo" />
      </Link>
      <div className="header-right">
        <span>Xin chào, User!</span>
        {/* 5. Gắn sự kiện onClick vào nút bấm */}
        <button onClick={handleLogout} className="logout-button">Đăng xuất</button>
      </div>
    </header>
  );
};

export default Header;