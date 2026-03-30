import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Search, ShoppingCart, User } from 'lucide-react';

import { useAuth } from '../context/authContext';
import { getCartItems } from '../services/cartService';
import { getCategories } from '../services/categoryService';
import { CART_UPDATED_EVENT } from '../utils/cartEvents';
import '../styles/navbar.css';

function normalize(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function Navbar() {
  const { isLoggedIn, role, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [catsOpen, setCatsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCatsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadCartCount = useCallback(async () => {
    if (!isLoggedIn) {
      setCartCount(0);
      return;
    }
    try {
      const items = await getCartItems();
      const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadCartCount();
  }, [loadCartCount]);

  useEffect(() => {
    const refresh = () => {
      loadCartCount();
    };

    window.addEventListener(CART_UPDATED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [loadCartCount]);

  const catalogPath = useMemo(() => {
    if (isLoggedIn && (role === 'distributor' || role === 'admin')) {
      return '/catalog/b2b';
    }
    return '/catalog';
  }, [isLoggedIn, role]);

  const handleSearch = (event) => {
    event.preventDefault();
    const raw = query.trim();
    if (!raw) return;

    const term = normalize(raw);
    const matchedCategory = categories.find((cat) => normalize(cat.name).includes(term));

    if (matchedCategory) {
      navigate(`${catalogPath}?category=${matchedCategory.id}`);
    } else {
      navigate(`${catalogPath}?q=${encodeURIComponent(raw)}`);
    }

    setQuery('');
    setCatsOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner page-shell">
        <Link to="/" className="brand" aria-label="AutoParts inicio">
          <span className="b1">AUTO</span>
          <span className="b2">PARTS</span>
        </Link>

        <nav className="menu" aria-label="Navegacion principal">
          <Link to={catalogPath} className="menu-link" data-testid="nav-catalog-link">Catalogo</Link>

          <div className="menu-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="menu-link menu-dropdown-trigger"
              onClick={() => setCatsOpen((value) => !value)}
              aria-expanded={catsOpen}
              aria-haspopup="menu"
            >
              Categorias <ChevronDown size={14} className={catsOpen ? 'rot' : ''} aria-hidden="true" />
            </button>
            <ul className={`dropdown ${catsOpen ? 'show' : ''}`} aria-label="Categorias">
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`${catalogPath}?category=${category.id}`);
                      setCatsOpen(false);
                    }}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Link to="/about" className="menu-link" data-testid="nav-about-link">Nosotros</Link>
          <Link to="/contact" className="menu-link" data-testid="nav-contact-link">Contacto</Link>
          {isLoggedIn && role === 'admin' && (
            <Link to="/admin-app" className="menu-link" data-testid="nav-admin-link">Backoffice</Link>
          )}
        </nav>

        <form className="search" onSubmit={handleSearch} aria-label="Buscar productos">
          <input
            type="search"
            name="search"
            autoComplete="off"
            placeholder="Buscar producto, marca o categoria"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            data-testid="nav-search-input"
          />
          <button type="submit" aria-label="Buscar">
            <Search size={16} aria-hidden="true" />
          </button>
        </form>

        <div className="actions">
          {isLoggedIn && (
            <Link to="/cart" className="act-icon cart-icon" aria-label="Carrito" data-testid="nav-cart-link">
              <ShoppingCart size={20} aria-hidden="true" />
              {cartCount > 0 && (
                <span className="cart-badge" data-testid="nav-cart-count">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <>
              <Link to="/profile" className="act-icon" aria-label="Perfil" data-testid="nav-profile-link">
                <User size={20} aria-hidden="true" />
              </Link>
              <button
                onClick={logout}
                className="act-icon"
                aria-label="Cerrar sesion"
                type="button"
                data-testid="nav-logout-btn"
              >
                <LogOut size={20} aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="act-btn" data-testid="nav-login-link">Login</Link>
              <Link to="/register" className="act-btn reg" data-testid="nav-register-link">Registro</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

