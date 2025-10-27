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
import LinksPage from './pages/dashboard/LinksPage';
import ManageLinksPage from './pages/admin/ManageLinksPage';
import TasksPage from './pages/dashboard/TasksPage';
import ManageFeedbackPage from './pages/admin/ManageFeedbackPage';
import './App.css';
import { Category, Macro, Announcement } from './types';
import AdminRoute from './pages/components/AdminRoute';
import useAuthStore from './stores/useAuthStore';

// ----- BỔ SUNG: Hàm xây dựng cây danh mục -----
// (Chúng ta cần nó ở đây để truyền CÂY cho Dashboard và CategoryDetail)
const buildCategoryTree = (categories: Category[], parentId: string | null = null): Category[] => {
  return categories
    .filter(category => (category.parent || null) === (parentId ? parentId.toString() : null)) 
    .map(category => ({
      ...category,
      children: buildCategoryTree(categories, category._id)
    }));
};

function App() {
  const [isAdmin] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]); // Sẽ lưu trữ CÂY
  const [flatCategories, setFlatCategories] = useState<Category[]>([]); // Sẽ lưu trữ list PHẲNG
  const [macros, setMacros] = useState<Macro[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { token, logout } = useAuthStore(); 

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setCategories([]);
        setFlatCategories([]); // Reset
        setMacros([]);
        setAnnouncements([]);
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // API categories giờ trả về PHẲNG (nhưng CÓ parent)
        const [macrosRes, categoriesRes, announcementsRes] = await Promise.all([
          fetch('/api/macros', { headers }),
          fetch('/api/categories', { headers }), 
          fetch('/api/announcements', { headers })
        ]);

        if (macrosRes.status === 401 || categoriesRes.status === 401) {
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          logout(); 
          return;
        }
        
        if (!macrosRes.ok || !categoriesRes.ok || !announcementsRes.ok) {
            throw new Error('Không thể tải dữ liệu từ máy chủ.');
        }

        const macrosData = await macrosRes.json();
        const categoriesData = await categoriesRes.json(); // Đây là danh sách phẳng
        const announcementsData = await announcementsRes.json();
        
        setMacros(macrosData);
        
        // --- SỬA: Lưu cả danh sách phẳng VÀ cây danh mục ---
        setFlatCategories(categoriesData); // 1. Lưu danh sách phẳng
        // 2. Xây dựng cây (chỉ các mục gốc) và lưu
        setCategories(buildCategoryTree(categoriesData, null)); 
        // --- KẾT THÚC SỬA ---
        
        setAnnouncements(announcementsData);

      } catch (error: any) {
        toast.error(error.message);
      }
    };

    fetchData();
  }, [token, logout]); 

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Truyền cây (cấp 1) vào DashboardPage */}
            <Route index element={<DashboardPage categories={categories} macros={macros} announcements={announcements} />} />
            
            {/* SỬA LỖI MẤT BỘ LỌC: Truyền CÂY vào allCategories */}
            <Route path="category/:categoryName" element={<CategoryDetailPage allMacros={macros} allCategories={categories} />} />
            
            {/* SỬA: Truyền danh sách PHẲNG cho ContributePage */}
            <Route path="contribute" element={<ContributePage flatCategories={flatCategories} />} />
            
            <Route path="links" element={<LinksPage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
         <Route element={<AdminRoute />}>
            <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/dashboard" />}>
            
            {/* SỬA: ManageCategories cần danh sách phẳng để tự xây dựng cây */}
            <Route path="categories" element={<ManageCategories initialCategories={flatCategories} />} /> 
            
            {/* SỬA: ManageMacros cần danh sách phẳng */}
            <Route path="macros" element={<ManageMacros categories={flatCategories} macros={macros} setMacros={setMacros} />} />
            
            <Route path="announcements" element={<ManageAnnouncements announcements={announcements} setAnnouncements={setAnnouncements} />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="links" element={<ManageLinksPage />} />
            <Route path="feedback" element={<ManageFeedbackPage />} />
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
