import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Header from '../components/Header';
import './AdminLayout.css';

function AdminLayout() {
  return (
    <div className="admin-layout">
      <Header />
      <div className="admin-container">
        <aside className="admin-sidebar">
          <nav>
            <NavLink to="/admin/categories">Quản lý Danh mục</NavLink>
            <NavLink to="/admin/macros">Quản lý Macro</NavLink>
            <NavLink to="/admin/users">Quản lý Thành viên</NavLink>
            <NavLink to="/admin/announcements">Quản lý Thông báo</NavLink>
            <NavLink to="/admin/analytics">Phân tích đánh giá</NavLink>
          </nav>
        </aside>
        <main className="admin-content">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
