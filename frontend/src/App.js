// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/authContext';
import Navbar from './components/Navbar';
import Footer from './components/footer';

import Home from './pages/home';
import Catalog from './pages/catalog';
import B2BCatalog from './pages/b2bCatalog';
import ProductDetail from './pages/productDetail';
import Cart from './pages/cart';
import OrderSummary from './pages/orderSummary';
import Login from './pages/login';
import Register from './pages/register';
import About from './pages/about';
import Contact from './pages/contact';
import Profile from './pages/profile';
import CheckoutSuccess from './components/checkoutSuccess';

// Ruta protegida según rol
function ProtectedRoute({ allowedRoles, children }) {
  const { isLoggedIn, role } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        {/* Toasts globales */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route
              path="/catalog/b2b"
              element={
                <ProtectedRoute allowedRoles={[ 'distributor', 'admin' ]}>
                  <B2BCatalog />
                </ProtectedRoute>
              }
            />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={[ 'customer', 'distributor', 'admin' ]}>
                  <Cart />
                </ProtectedRoute>
              }
            />

            <Route path="/profile" element={<Profile />} />

            {/* Resumen de pedido */}
            <Route path="/order/:id" element={<OrderSummary />} />

            {/* Página pública de éxito de pago */}
            <Route path="/checkout/success" element={<CheckoutSuccess />} />

            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
