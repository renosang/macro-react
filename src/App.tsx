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
import DashboardLayout from './pages/dashboard/DashboardLayout'; // Layout mới cho Dashboard

import './App.css';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
export interface Category { id: number; name: string; }
export interface Macro { id: number; title: string; category: string; content: Descendant[]; }
export interface Announcement {
  id: number;
  content: Descendant[];
  timestamp: string;
}

// --- DỮ LIỆU KHỞI TẠO VÀ HÀM MIGRATE ---
const initialCategories: Category[] = [
  { id: 1, name: 'Hướng dẫn sử dụng' },
  { id: 2, name: 'Chính sách bảo hành' },
  { id: 3, name: 'Câu hỏi thường gặp' },
];
const initialMacros: Macro[] = [
    { id: 1, title: 'Hướng dẫn cài đặt phần mềm', category: 'Hướng dẫn sử dụng', content: [{ type: 'paragraph', children: [{ text: 'Nội dung...' }] }] },
    { id: 2, title: 'Quy định đổi trả hàng', category: 'Chính sách bảo hành', content: [{ type: 'paragraph', children: [{ text: 'Nội dung...' }] }] },
];
const migrateMacrosData = (data: any[]): Macro[] => {
  return data.map(macro => {
    if (typeof macro.content === 'string') {
      return { ...macro, content: [{ type: 'paragraph', children: [{ text: macro.content }] }] };
    }
    if (!macro.content || !Array.isArray(macro.content)) {
        return { ...macro, content: [{ type: 'paragraph', children: [{ text: '' }] }] };
    }
    return macro;
  });
};

function App() {
  // --- LOGIC STATE ---
  const [isAdmin, setIsAdmin] = useState(true);
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('categories');
      return saved ? JSON.parse(saved) : initialCategories;
    } catch { return initialCategories; }
  });
  const [macros, setMacros] = useState<Macro[]>(() => {
    try {
      const saved = localStorage.getItem('macros');
      return saved ? migrateMacrosData(JSON.parse(saved)) : initialMacros;
    } catch { return initialMacros; }
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('announcements');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('macros', JSON.stringify(macros)); }, [macros]);
  useEffect(() => { localStorage.setItem('announcements', JSON.stringify(announcements)); }, [announcements]);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* --- NHÓM ROUTE CHO DASHBOARD (SỬ DỤNG LAYOUT RIÊNG) --- */}
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

        {/* --- NHÓM ROUTE CHO ADMIN (GIỮ NGUYÊN) --- */}
        <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/login" />}>
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
          <Route index element={<Navigate to="categories" />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;