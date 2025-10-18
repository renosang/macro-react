import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
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
import ContributePage from './pages/dashboard/ContributePage';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import './App.css';
import { Category, Macro, Announcement } from './types';
import AdminRoute from './pages/components/AdminRoute';
import useAuthStore from './stores/useAuthStore'; // --- BỔ SUNG ---

function App() {
  const [isAdmin] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [macros, setMacros] = useState<Macro[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { token, logout } = useAuthStore(); // --- BỔ SUNG: Lấy token và hàm logout từ store ---

  useEffect(() => {
    const fetchData = async () => {
      // Nếu không có token (chưa đăng nhập), xóa dữ liệu cũ và không làm gì cả
      if (!token) {
        setCategories([]);
        setMacros([]);
        setAnnouncements([]);
        return;
      }

      try {
        // Tạo header có chứa token để xác thực
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        // Gọi đồng thời các API với header xác thực
        const [macrosRes, categoriesRes, announcementsRes] = await Promise.all([
          fetch('/api/macros', { headers }),
          fetch('/api/categories', { headers }),
          fetch('/api/announcements', { headers })
        ]);

        // Nếu có lỗi xác thực (token hết hạn), thông báo và logout
        if (macrosRes.status === 401 || categoriesRes.status === 401 || announcementsRes.status === 401) {
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          logout(); // Tự động logout người dùng
          return;
        }

        if (!macrosRes.ok || !categoriesRes.ok || !announcementsRes.ok) {
            throw new Error('Không thể tải dữ liệu từ máy chủ.');
        }

        const macrosData = await macrosRes.json();
        const categoriesData = await categoriesRes.json();
        const announcementsData = await announcementsRes.json();
        
        setMacros(macrosData);
        setCategories(categoriesData);
        setAnnouncements(announcementsData);

      } catch (error: any) {
        toast.error(error.message);
      }
    };

    fetchData();
  }, [token, logout]); // Thêm token và logout vào dependency array

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage categories={categories} macros={macros} announcements={announcements} />} />
            <Route path="category/:categoryName" element={<CategoryDetailPage allMacros={macros} />} />
            <Route path="contribute" element={<ContributePage />} />
          </Route>
         <Route element={<AdminRoute />}>
          <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/dashboard" />}>
            <Route path="categories" element={<ManageCategories categories={categories} setCategories={setCategories} />} />
            <Route path="macros" element={<ManageMacros categories={categories} macros={macros} setMacros={setMacros} />} />
            <Route path="announcements" element={<ManageAnnouncements announcements={announcements} setAnnouncements={setAnnouncements} />} />
             <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route index element={<Navigate to="categories" />} />
          </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;