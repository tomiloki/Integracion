import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/authContext";
import Footer from "./components/footer";
import Navbar from "./components/Navbar";
import CheckoutSuccess from "./components/checkoutSuccess";
import About from "./pages/about";
import AdminDashboard from "./pages/adminDashboard";
import B2BCatalog from "./pages/b2bCatalog";
import Cart from "./pages/cart";
import Catalog from "./pages/catalog";
import Contact from "./pages/contact";
import Home from "./pages/home";
import Login from "./pages/login";
import OrderSummary from "./pages/orderSummary";
import ProductDetail from "./pages/productDetail";
import Profile from "./pages/profile";
import Register from "./pages/register";

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
        <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} pauseOnHover />

        <main className="main-content" id="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route
              path="/catalog/b2b"
              element={
                <ProtectedRoute allowedRoles={["distributor", "admin"]}>
                  <B2BCatalog />
                </ProtectedRoute>
              }
            />
            <Route path="/product/:id" element={<ProductDetail />} />

            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={["customer", "distributor", "admin"]}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["customer", "distributor", "admin"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order/:id"
              element={
                <ProtectedRoute allowedRoles={["customer", "distributor", "admin"]}>
                  <OrderSummary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-app"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

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

