import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import toast from 'react-hot-toast';
import './LoginPage.css'; // Chúng ta sẽ tạo file CSS này

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const loginAction = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Đang đăng nhập...');

    // --- LOGIC XÁC THỰC ---
    // Trong thực tế, bạn sẽ gọi API đến server Node.js ở đây.
    // Hiện tại, chúng ta sẽ giả lập một cuộc gọi API.
    try {
      // Giả lập gọi API mất 1 giây
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (username === 'admin' && password === 'admin') {
        const fakeToken = 'jwt.token.from.backend'; // Token nhận về từ server
        loginAction(fakeToken);
        toast.success('Đăng nhập thành công!', { id: loadingToast });
        navigate('/dashboard', { replace: true }); // Chuyển hướng về dashboard
      } else {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (error: any) {
      toast.error(error.message || 'Đã có lỗi xảy ra', { id: loadingToast });
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Macro Management</h2>
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
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
};

export default LoginPage;