import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Descendant } from 'slate';

// --- IMPORT CÁC COMPONENT VÀ LAYOUT ---
import LoginPage from './pages/login/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminLayout from './pages/admin/AdminLayout';
import ManageCategories from './pages/admin/ManageCategories';
import ManageMacros from './pages/admin/ManageMacros';
import CategoryDetailPage from './pages/dashboard/CategoryDetailPage';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ProtectedRoute from './pages/components/ProtectedRoute'; // Import ProtectedRoute

import './App.css';
import { Category, Macro, Announcement } from './types'; // Import từ file types chính

function App() {
  const [isAdmin] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]); // Khởi tạo mảng rỗng
  const [macros, setMacros] = useState<Macro[]>(() => {
    try {
      const saved = localStorage.getItem('macros');
      // Logic migrate dữ liệu cũ (nếu cần)
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.map((macro: any) => {
        if (typeof macro.content === 'string') {
          return { ...macro, content: [{ type: 'paragraph', children: [{ text: macro.content }] }] };
        }
        if (!macro.content || !Array.isArray(macro.content)) {
            return { ...macro, content: [{ type: 'paragraph', children: [{ text: '' }] }] };
        }
        return macro;
      });
    } catch { 
      return []; 
    }
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('announcements');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Fetch categories từ API khi ứng dụng khởi động
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Lỗi khi tải danh mục:", err));
  }, []);

  // Các state khác vẫn lưu vào localStorage
  useEffect(() => { localStorage.setItem('macros', JSON.stringify(macros)); }, [macros]);
  useEffect(() => { localStorage.setItem('announcements', JSON.stringify(announcements)); }, [announcements]);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Route công khai */}
        <Route path="/login" element={<LoginPage />} />

        {/* Các route được bảo vệ */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route 
              index 
              element={<DashboardPage categories={categories} macros={macros} announcements={announcements} />} 
            />
            <Route 
              path="category/:categoryName" 
              element={<CategoryDetailPage allMacros={macros} />} 
            />
          </Route>

          <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/dashboard" />}>
            <Route 
              path="categories" 
              element={<ManageCategories categories={categories} setCategories={setCategories} />} 
            />
            <Route 
              path="macros" 
              element={<ManageMacros categories={categories} macros={macros} setMacros={setMacros} />} 
            />
            <Route 
              path="announcements" 
              element={<ManageAnnouncements announcements={announcements} setAnnouncements={setAnnouncements} />}
            />
            <Route 
              path="users" 
              element={<ManageUsersPage />} 
            />
            <Route index element={<Navigate to="categories" />} />
          </Route>
        </Route>

        {/* Route mặc định, nên trỏ về login hoặc dashboard tùy thuộc vào trạng thái đăng nhập */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;