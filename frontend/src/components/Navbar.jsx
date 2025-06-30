import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ShoppingCart, User, LogOut } from 'lucide-react';
import { getCategories } from '../services/categoryService';
import { useAuth } from '../context/authContext';
import '../styles/navbar.css';

export default function Navbar() {
  const { isLoggedIn, role, logout } = useAuth();
  const [q, setQ] = useState('');
  const [catsOpen, setCatsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const catRef = useRef();

  // Carga categorías una sola vez
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(err => console.error('Error fetching categories', err));
  }, []);

  // Cierra dropdown si clic fuera
  useEffect(() => {
    const handler = e => {
      if (catRef.current && !catRef.current.contains(e.target)) {
        setCatsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const catalogPath = isLoggedIn && (role === 'distributor' || role === 'admin')
    ? '/catalog/b2b'
    : '/catalog';

  // importa o define esta función arriba del componente
function normalize(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const handleSearch = e => {
  e.preventDefault();
  const raw = q.trim();
  if (!raw) return;

  // 1) normalizamos la entrada
  const term = normalize(raw);

  // 2) buscamos si coincide con alguna categoría
  const matchedCat = categories.find(cat =>
    normalize(cat.name).includes(term)
  );

  if (matchedCat) {
    // si hay match de categoría, navegamos por categoría
    navigate(`${catalogPath}?category=${matchedCat.id}`);
  } else {
    // si no, buscamos por q (servidor ya hace el matching name+cat internamente)
    navigate(`${catalogPath}?q=${encodeURIComponent(term)}`);
  }

  // limpiamos el input y cerramos dropdown
  setQ('');
  setCatsOpen(false);
};


  const handleCategoryClick = id => {
    navigate(`${catalogPath}?category=${id}`);
    setCatsOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <a
          href="/"
          onClick={e => {
            e.preventDefault();
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="brand"
        >
          <span className="b1">Auto</span><span className="b2">Parts</span>
        </a>

        {/* Menú */}
        <nav className="menu">
          <Link to={catalogPath} className="menu-link">Catálogo</Link>
          <div
            ref={catRef}
            className="menu-link cats"
            onClick={() => setCatsOpen(o => !o)}
          >
            Categorías <ChevronDown size={14} className={catsOpen ? 'rot' : ''} />
            <ul className={`dropdown ${catsOpen ? 'show' : ''}`}>
              {categories.map(cat => (
                <li key={cat.id} onClick={() => handleCategoryClick(cat.id)}>
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>
          <Link to="/about" className="menu-link">Nosotros</Link>
          <Link to="/contact" className="menu-link">Contacto</Link>
        </nav>

        {/* Búsqueda */}
        <form className="search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button type="submit">
            <Search size={16} />
          </button>
        </form>

        {/* Acciones */}
        <div className="actions">
          {isLoggedIn && (
            <Link to="/cart" className="act-icon">
              <ShoppingCart size={20} />
            </Link>
          )}
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="act-icon">
                <User size={20} />
              </Link>
              <button onClick={logout} className="act-icon">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="act-btn">Login</Link>
              <Link to="/register" className="act-btn reg">Registro</Link>
            </>
          )}
        </div>
      </div>
    </header>
);
}
