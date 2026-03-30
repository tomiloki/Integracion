import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ProductCard from '../components/productCard';
import { getCategories } from '../services/categoryService';
import { getProducts } from '../services/productService';
import '../styles/catalog.css';

function buildSearchParams({ q, category }) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  return params.toString();
}

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestSeed, setRequestSeed] = useState(0);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('category') || '';
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    getProducts({ q: query, category: categoryId })
      .then((data) => {
        if (!mounted) return;
        setProducts(data.results ?? data);
      })
      .catch(() => {
        if (!mounted) return;
        setError('No fue posible cargar los productos para este filtro.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [query, categoryId, requestSeed]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const productCountLabel = useMemo(() => {
    if (loading) return 'Cargando resultados';
    return `${products.length} resultados visibles`;
  }, [loading, products.length]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const qs = buildSearchParams({ q: searchTerm.trim(), category: categoryId });
    navigate(qs ? `/catalog?${qs}` : '/catalog');
  };

  const handleCategoryClick = (nextCategory) => {
    const qs = buildSearchParams({ q: query, category: nextCategory });
    navigate(qs ? `/catalog?${qs}` : '/catalog');
  };

  return (
    <section className="catalog-page page-shell fade-in-up">
      <header className="catalog-hero">
        <div>
          <p className="catalog-kicker">Inventario Tecnico</p>
          <h1>Catalogo de Repuestos</h1>
          <p className="catalog-copy">Filtra por categoria o SKU y completa tu compra sin friccion.</p>
        </div>
        <p className="catalog-count" aria-live="polite">{productCountLabel}</p>
      </header>

      <form className="catalog-search" onSubmit={handleSearchSubmit}>
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          name="catalog-search"
          autoComplete="off"
          placeholder="Buscar por nombre, marca o SKU"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Buscar productos en catalogo"
        />
        <button type="submit" className="btn-primary">Buscar</button>
      </form>

      <nav className="filter-bar" aria-label="Filtros por categoria">
        <ul className="cat-scroll" data-testid="catalog-categories">
          <li>
            <button
              type="button"
              className={!categoryId ? 'active' : ''}
              onClick={() => handleCategoryClick('')}
              data-testid="catalog-category-all"
            >
              Todas
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                className={category.id.toString() === categoryId ? 'active' : ''}
                onClick={() => handleCategoryClick(category.id.toString())}
                data-testid={`catalog-category-${category.id}`}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {loading && (
        <div className="catalog-skeleton-grid" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="catalog-skeleton-card skeleton" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="state-panel error" role="status">
          <p>{error}</p>
          <button type="button" className="btn-secondary" onClick={() => setRequestSeed((value) => value + 1)}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="state-panel">No hay productos para este filtro. Intenta con otra categoria o busqueda.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="product-grid" data-testid="catalog-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

