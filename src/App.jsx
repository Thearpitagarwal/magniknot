import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { subscribeToAuthChanges } from './services/api';

import HomePage from './pages/HomePage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import CategoriesPage from './pages/admin/CategoriesPage';
import ProductsPage from './pages/admin/ProductsPage';
import SettingsPage from './pages/admin/SettingsPage';
import PromotionsPage from './pages/admin/PromotionsPage';
import StorefrontLayout from './components/storefront/StorefrontLayout';
import { BagProvider } from './context/BagContext';
import { PromotionsProvider } from './context/PromotionsContext';

function App() {
  const [isAdminAuthLoading, setIsAdminAuthLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setAdminUser(user);
      setIsAdminAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isAdminAuthLoading) {
    return null;
  }

  return (
    <>
      {/* ── Main App ── */}
      <BagProvider>
        <PromotionsProvider>
          <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<StorefrontLayout />}>
              <Route index element={<HomePage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={adminUser ? <Navigate to="/admin" replace /> : <AdminLogin />} />
            
            <Route 
              path="/admin" 
              element={adminUser ? <AdminLayout /> : <Navigate to="/admin/login" replace />}
            >
              <Route index element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="promotions" element={<PromotionsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </PromotionsProvider>
      </BagProvider>
    </>
  );
}

export default App;
