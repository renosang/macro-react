import React from 'react';
import { Link } from 'react-router-dom'; // Import Link component
import './Header.css';

// Giả sử bạn có file logo trong thư mục src/logo.png
// Chúng ta sẽ cần import nó để Webpack/Vite xử lý
import companyLogo from '../../logo.png'; // <-- ĐÃ BỔ SUNG DÒNG NÀY

function Header() {
  return (
    <header className="app-header">
      <div className="header-left">
        {/* Bọc logo trong Link để khi click sẽ điều hướng */}
        <Link to="/dashboard" className="logo-link"> 
          <img src={companyLogo} alt="ThienTu" className="header-logo" />
        </Link>
      </div>
      <div className="header-right">
        <span>Xin chào, User!</span>
        <button className="logout-button">Đăng xuất</button>
      </div>
    </header>
  );
}

export default Header;