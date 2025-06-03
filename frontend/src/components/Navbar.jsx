// frontend/src/components/Navbar.jsx

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { parseJwt } from '../utils/jwt';
import { Search, ChevronDown } from 'lucide-react';
import '../styles/navbar.css';

export default function Navbar() {
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const categoriesRef = useRef(null);

  // Cada vez que la ruta cambia, volvemos a leer el token para actualizar el navbar
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      const payload = parseJwt(token);
      setUserRole(payload?.role || null);
    } else {
      setUserRole(null);
    }
  }, [location]);

  // Listener para cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Botón Cerrar Sesión: borra tokens y redirige a login
  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUserRole(null);
    navigate('/login');
  };

  // Al enviar búsqueda: navegamos a "/?q=..."
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (q) {
      navigate(`/?q=${encodeURIComponent(q)}`);
      setSearchTerm('');
    }
  };

  // Toggle dropdown categorías
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // Click en logo: volver al home y hacer scroll top
  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* 1. LOGO */}
        <a href="/" onClick={handleLogoClick} className="navbar-brand">
          <span className="brand-part1">Auto</span>
          <span className="brand-part2">Parts</span>
        </a>

        {/* 2. MENÚ PRINCIPAL */}
        <nav className="navbar-menu">
          <Link to="/" className="nav-link">
            Catálogo
          </Link>

          {/* Dropdown categorías */}
          <div
            ref={categoriesRef}
            className={`nav-link categories ${dropdownOpen ? 'open' : ''}`}
            onClick={toggleDropdown}
          >
            Categorías <ChevronDown size={14} className="dropdown-icon" />
          </div>
          <div className="nav-dropdown">
            <ul>
              <li>
                <Link to="/?category=aceite" className="dropdown-item">
                  Filtros de Aceite
                </Link>
              </li>
              <li>
                <Link to="/?category=frenos" className="dropdown-item">
                  Frenos
                </Link>
              </li>
              <li>
                <Link to="/?category=bujias" className="dropdown-item">
                  Bujías
                </Link>
              </li>
              <li>
                <Link to="/?category=iluminacion" className="dropdown-item">
                  Iluminación
                </Link>
              </li>
              <li>
                <Link to="/?category=accesorios" className="dropdown-item">
                  Accesorios
                </Link>
              </li>
            </ul>
          </div>

          {/* Enlace “Mayorista” solo para distributor/admin */}
          {(userRole === 'distributor' || userRole === 'admin') && (
            <Link to="/catalog/b2b" className="nav-link">
              Mayorista
            </Link>
          )}

          {/* Enlace “Carrito” solo si está autenticado */}
          {userRole && (
            <Link to="/cart" className="nav-link">
              Carrito
            </Link>
          )}
        </nav>

        {/* 3. BARRA DE BÚSQUEDA */}
        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn-search">
            <Search size={18} />
          </button>
        </form>

        {/* 4. BOTONES DE ACCIÓN */}
        <div className="navbar-actions">
          {userRole ? (
            <button className="nav-button logout-button" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-button login-button">
                Login
              </Link>
              <Link to="/register" className="nav-button register-button">
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
