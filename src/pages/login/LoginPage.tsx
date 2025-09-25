import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
 // const [user, setUser] = useState('');

  // Khi component được tải, kiểm tra xem có tên đăng nhập nào đã được lưu không
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Xử lý logic ghi nhớ tài khoản
    if (rememberMe) {
      localStorage.setItem('rememberedUsername', username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }

    try {
      const response = await fetch('https://macro-react-xi.vercel.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      //setUser(data.user);
      console.log('Login response data:', data); // Kiểm tra dữ liệu phản hồi 

      if (response.ok) {
        login(data.token, data.user);
        navigate('/dashboard?userrole=' + data.user.role);
      } else {
        alert(data.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h2>Đăng nhập hệ thống</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={toggleShowPassword}
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </div>
          <div className="options-group">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Ghi nhớ tài khoản
            </label>
          </div>
          <button type="submit" className="login-button">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

