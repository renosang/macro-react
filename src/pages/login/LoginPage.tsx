import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import toast from 'react-hot-toast';
import axios from 'axios'; // <-- Import axios
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
  const loginAction = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Đang đăng nhập...');

    try {
      // --- GỌI API BACKEND THẬT SỰ ---
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });

      // Lấy token từ response của server
      const { token } = response.data;

      if (token) {
        loginAction(token); // Lưu token vào store
        toast.success('Đăng nhập thành công!', { id: loadingToast });
        navigate('/dashboard', { replace: true }); // Chuyển hướng
      } else {
        // Trường hợp server không trả về token dù không báo lỗi
        throw new Error('Không nhận được token xác thực.');
      }

    } catch (error: any) {
      // Lấy thông báo lỗi từ server nếu có, không thì báo lỗi chung
      const errorMessage = error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng!';
      toast.error(errorMessage, { id: loadingToast });
      setIsLoading(false);
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
            disabled={isLoading}
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
            disabled={isLoading}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;