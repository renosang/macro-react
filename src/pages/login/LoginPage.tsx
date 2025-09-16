import React from 'react';
import './LoginPage.css';

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-form-container">
        <h2>Đăng nhập hệ thống</h2>
        <form>
          <div className="input-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="login-button">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;