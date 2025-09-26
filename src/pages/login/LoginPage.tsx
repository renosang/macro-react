import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './LoginPage.css';
import useAuthStore from '../../stores/useAuthStore';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  // Lấy hàm login và giá trị token từ store
  const { login, token } = useAuthStore();

  // --- LOGIC CHUYỂN HƯỚNG TỰ ĐỘNG ---
  useEffect(() => {
    // Nếu trong store đã có token (nghĩa là người dùng đã đăng nhập)
    if (token) {
      // Chuyển hướng ngay lập tức về trang chủ
      // { replace: true } để người dùng không thể nhấn "Back" quay lại trang login
      navigate('/dashboard', { replace: true });
    }
    // Effect này sẽ chạy mỗi khi giá trị token thay đổi hoặc khi component được tải lần đầu
  }, [token, navigate]);
  // ------------------------------------

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
        // Gọi hàm login để lưu thông tin vào store
        login(user, data.token);

        toast.success('Đăng nhập thành công!');
        // Chuyển hướng đến trang chủ sau khi đăng nhập thành công
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

  // Nếu đã có token, không cần render form, dù chỉ trong một khoảnh khắc
  if (token) {
    return null;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/logo.png" alt="Logo" className="login-logo" />
        <h2>Đăng nhập</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="login-btn">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;