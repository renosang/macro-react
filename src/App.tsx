import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

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
import ProtectedRoute from './pages/components/ProtectedRoute';

import './App.css';
import { Category, Macro, Announcement } from './types';

function App() {
  const [isAdmin] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [macros, setMacros] = useState<Macro[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Fetch tất cả dữ liệu từ API khi ứng dụng khởi động
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Lỗi khi tải danh mục:", err));
      
    fetch('/api/macros')
      .then(res => res.json())
      .then(data => setMacros(data))
      .catch(err => console.error("Lỗi khi tải macros:", err));

    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(err => console.error("Lỗi khi tải thông báo:", err));
  }, []);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

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

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

