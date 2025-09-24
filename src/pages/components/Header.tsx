import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import './Header.css';
// Logo sẽ được tham chiếu trực tiếp từ thư mục public, không cần import

function Header() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/dashboard" className="logo-link">
          {/* Sử dụng process.env.PUBLIC_URL để có đường dẫn tuyệt đối chính xác */}
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="ThienTu" className="header-logo" />
        </Link>
      </div>
      <div className="header-right">
        <span>Xin chào, User!</span>
        <button className="logout-button" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default Header;

