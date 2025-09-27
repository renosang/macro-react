import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import './Header.css';

function Header() {
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
  }));

  console.log('Current user:', user); // Kiểm tra thông tin user
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  // const [userRole, setUserRole] = useState('');
  useEffect(() => {
const urlParams = new URLSearchParams(window.location.search);
const userRole = urlParams.get('userrole');
// setUserRole(userRole || '');

  }, [user]);

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/dashboard" className="logo-link">
          <img src={process.env.PUBLIC_URL + '/logo.png'} alt="ThienTu" className="header-logo" />
        </Link>
      </div>
      <div className="header-right">
        <span className="user-greeting">Xin chào, Chúc bạn làm việc hiệu quả ❤️</span>        
        {/* Chỉ hiển thị nút này cho user thường */}
        {/* {userRole === 'user' && ( */}
             <button className="contribute-button" onClick={() => navigate('/dashboard/contribute')}>
                Đóng góp Macro
             </button>
        {/* )} */}
        <button className="logout-button" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default Header;

