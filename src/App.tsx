import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import './App.css';
import { Category, Macro, Announcement } from './types';
import AdminRoute from './pages/components/AdminRoute'; 

function App() {
  const [isAdmin] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [macros, setMacros] = useState<Macro[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    // A stable component that fetches data is better than fetching in App.tsx
    // But for now, this will do.
    const fetchData = async () => {
      try {
        const [catRes, macroRes, annRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/macros'), // This fetches only approved macros
          fetch('/api/announcements')
        ]);
        const catData = await catRes.json();
        const macroData = await macroRes.json();
        const annData = await annRes.json();
        setCategories(catData);
        setMacros(macroData);
        setAnnouncements(annData);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };
    fetchData();
  }, []);

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

