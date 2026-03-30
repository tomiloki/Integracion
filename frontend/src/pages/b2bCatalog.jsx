import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import ProductCard from '../components/productCard';
import { getCategories } from '../services/categoryService';
import { getProducts } from '../services/productService';
import '../styles/b2bCatalog.css';

export default function B2BCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({ channel: 'b2b', category: selectedCategory, q: search })
      .then((data) => setProducts(data.results ?? data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  return (
    <section className="page-shell b2b-page fade-in-up">
      <header className="b2b-hero">
        <p className="b2b-kicker">Canal Mayorista</p>
        <h1>Catalogo B2B</h1>
        <p>Precios preferenciales para distribuidores con foco en rotacion y volumen.</p>
      </header>

      <div className="b2b-filters">
        <label className="b2b-search" htmlFor="b2b-search">
          <Search size={16} aria-hidden="true" />
          <input
            id="b2b-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por SKU, nombre o marca"
          />
        </label>

        <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
          <option value="">Todas las categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="b2b-grid" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="b2b-card skeleton" style={{ minHeight: '290px' }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="state-panel">No hay resultados para este filtro.</p>
      ) : (
        <div className="b2b-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

