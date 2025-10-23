import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './LoginPage.css';
import useAuthStore from '../../stores/useAuthStore';

const REMEMBER_USERNAME_KEY = 'rememberedUsername';
const REMEMBER_PASSWORD_KEY = 'rememberedPassword'; // Key mới cho mật khẩu

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login, token } = useAuthStore();

  // Load username và password đã lưu khi component mount
  useEffect(() => {
    const rememberedUsername = localStorage.getItem(REMEMBER_USERNAME_KEY);
    const rememberedPassword = localStorage.getItem(REMEMBER_PASSWORD_KEY); // Lấy mật khẩu đã lưu
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
      // Chỉ điền mật khẩu nếu username cũng được lưu
      if (rememberedPassword) {
        setPassword(rememberedPassword);
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = { id: data.id, username: data.username, role: data.role };
        login(user, data.token);

        // Xử lý lưu hoặc xóa username và password dựa trên checkbox
        if (rememberMe) {
          localStorage.setItem(REMEMBER_USERNAME_KEY, username);
          // !!! CẢNH BÁO: LƯU MẬT KHẨU VÀO LOCALSTORAGE LÀ KHÔNG AN TOÀN !!!
          localStorage.setItem(REMEMBER_PASSWORD_KEY, password);
        } else {
          localStorage.removeItem(REMEMBER_USERNAME_KEY);
          localStorage.removeItem(REMEMBER_PASSWORD_KEY);
        }

        toast.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        throw new Error(data.message || 'Đăng nhập thất bại.');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Đã có lỗi xảy ra.');
      }
    }
  };

  if (token) {
    return null;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Đăng nhập để tiếp tục</p>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
              autoComplete="username"
            />
          </div>
          <div className="input-group password-group">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          <div className="extra-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              {/* Sửa lại label */}
              <label htmlFor="remember">Ghi nhớ đăng nhập</label>
            </div>
          </div>

          <button type="submit" className="login-btn">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;