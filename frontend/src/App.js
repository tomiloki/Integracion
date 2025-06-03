// frontend/src/App.js
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { parseJwt } from './utils/jwt';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

import Navbar from './components/Navbar';
import Catalog from './pages/catalog';
import B2BCatalog from './pages/b2bCatalog';
import Cart from './pages/cart';
import Login from './pages/login';
import Register from './pages/register';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>© {new Date().getFullYear()} AutoParts. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem('access');
  if (!token) return <Navigate to="/login" replace />;
  const payload = parseJwt(token);
  const role = payload?.role || null;
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route
            path="/catalog/b2b"
            element={
              <ProtectedRoute allowedRoles={['distributor', 'admin']}>
                <B2BCatalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={['customer','distributor','admin']}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
