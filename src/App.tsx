import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Descendant } from 'slate';

import LoginPage from './pages/login/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminLayout from './pages/admin/AdminLayout';
import ManageCategories from './pages/admin/ManageCategories';
import ManageMacros from './pages/admin/ManageMacros';
import CategoryDetailPage from './pages/dashboard/CategoryDetailPage';
import './App.css';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
export interface Category {
  id: number;
  name: string;
}
export interface Macro {
  id: number;
  title: string;
  category: string;
  content: Descendant[];
}

// --- DỮ LIỆU BAN ĐẦU ---
const initialCategories: Category[] = [
  { id: 1, name: 'Hướng dẫn sử dụng' },
  { id: 2, name: 'Chính sách bảo hành' },
  { id: 3, name: 'Câu hỏi thường gặp' },
];
const initialMacros: Macro[] = [
    { 
      id: 1, 
      title: 'Hướng dẫn cài đặt phần mềm', 
      category: 'Hướng dẫn sử dụng', 
      content: [{ type: 'paragraph', children: [{ text: 'Đây là nội dung chi tiết về cách cài đặt phần mềm...' }] }] 
    },
    { 
      id: 2, 
      title: 'Quy định đổi trả hàng', 
      category: 'Chính sách bảo hành', 
      content: [{ type: 'paragraph', children: [{ text: 'Nội dung chi tiết về chính sách đổi trả hàng...' }] }] 
    },
];

// --- HÀM CHUYỂN ĐỔI DỮ LIỆU CŨ (PHIÊN BẢN ĐẦY ĐỦ) ---
const migrateMacrosData = (data: any[]): Macro[] => {
  return data.map(macro => {
    // Nếu content là string, chuyển nó về định dạng Slate
    if (typeof macro.content === 'string') {
      return {
        ...macro,
        content: [{ type: 'paragraph', children: [{ text: macro.content }] }]
      };
    }
    // Nếu content không hợp lệ (null, không phải mảng), trả về content rỗng
    if (!macro.content || !Array.isArray(macro.content)) {
       return {
        ...macro,
        content: [{ type: 'paragraph', children: [{ text: '' }] }]
       };
    }
    // Nếu đã đúng định dạng, trả về chính nó
    return macro;
  });
};


function App() {
  const [isAdmin, setIsAdmin] = useState(true);

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const savedCategories = localStorage.getItem('categories');
      return savedCategories ? JSON.parse(savedCategories) : initialCategories;
    } catch (error) {
      console.error("Failed to load categories from localStorage", error);
      return initialCategories;
    }
  });
  
  const [macros, setMacros] = useState<Macro[]>(() => {
    try {
      const savedMacros = localStorage.getItem('macros');
      if (savedMacros) {
        const parsedMacros = JSON.parse(savedMacros);
        return migrateMacrosData(parsedMacros);
      }
      return initialMacros;
    } catch (error) {
      console.error("Failed to load macros from localStorage", error);
      return initialMacros;
    }
  });

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('macros', JSON.stringify(macros));
  }, [macros]);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/dashboard" element={<DashboardPage categories={categories} macros={macros} />} />
        <Route path="/dashboard/category/:categoryName" element={<CategoryDetailPage allMacros={macros} />} />

        <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/login" />}>
          <Route 
            path="categories" 
            element={<ManageCategories categories={categories} setCategories={setCategories} />} 
          />
          <Route 
            path="macros" 
            element={<ManageMacros categories={categories} macros={macros} setMacros={setMacros} />} 
          />
          <Route index element={<Navigate to="categories" />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;