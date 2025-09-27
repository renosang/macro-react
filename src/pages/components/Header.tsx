import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import './Header.css';

function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/dashboard" className="logo-link">
          <img src={process.env.PUBLIC_URL + '/logo.png'} alt="ThienTu" className="header-logo" />
        </Link>
        <nav className="header-nav">
          {/* Liên kết này chỉ hiển thị khi người dùng là admin */}
          {user?.role === 'admin' && (
            <Link to="/admin">Trang quản trị</Link>
          )}
        </nav>
      </div>
      <div className="header-right">
        {/* Lời chào được cá nhân hóa */}
        <span className="user-greeting">Xin chào, Chúc bạn làm việc hiệu quả ❤️!</span>
        
          <button className="contribute-button" onClick={() => navigate('/dashboard/contribute')}>
            Đóng góp Macro
          </button>        
        <button className="logout-button" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default Header;