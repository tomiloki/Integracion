import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import ProductCard from '../components/productCard';
import '../styles/catalog.css';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('category') || '';

  // whenever q or categoryId changes, refetch
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    // pass filters into service (backend can handle or ignore unknown params)
    getProducts({ search: q, category: categoryId })
      .then(data => {
        if (!isMounted) return;
        setProducts(data.results ?? data);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('No fue posible cargar los productos.');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [q, categoryId]);

  // load categories once
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(err => console.error('Error al cargar categorías', err));
  }, []);

  // memoize filtered list (in case backend doesn't filter)
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = q
        ? p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.brand.toLowerCase().includes(q.toLowerCase())
        : true;
      const matchCategory = categoryId
        ? p.category.id.toString() === categoryId
        : true;
      return matchSearch && matchCategory;
    });
  }, [products, q, categoryId]);

  if (loading) {
    return <div className="center-container">Cargando catálogo…</div>;
  }
  if (error) {
    return <div className="center-container error">{error}</div>;
  }

  return (
    <section className="catalog-page">
      <div className="catalog-hero">
        <h1>Catálogo</h1>
      </div>

      <div className="catalog-container">
        {/* Filter Bar */}
        <div className="filter-bar">
          <ul className="cat-scroll">
            <li
              className={!categoryId ? 'active' : ''}
              onClick={() => navigate('/catalog')}
            >
              Todas
            </li>
            {categories.map(cat => (
              <li
                key={cat.id}
                className={cat.id.toString() === categoryId ? 'active' : ''}
                onClick={() => navigate(`/catalog?category=${cat.id}`)}
              >
                {cat.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <p className="no-products">No hay productos disponibles.</p>
        ) : (
          <div className="product-grid">
            {filtered.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
