// frontend/src/pages/catalog.jsx
import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import ProductCard from '../components/productCard';
import '../styles/catalog.css';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError('No se pudo cargar el catálogo.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="center-container">
        <div className="loader">Cargando productos...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="center-container">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <section className="catalog-container">
      <h2 className="catalog-title">Catálogo</h2>
      {products.length === 0 ? (
        <p className="no-products">No hay productos disponibles.</p>
      ) : (
        <div className="product-grid">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </section>
  );
}
