// frontend/src/pages/b2bCatalog.jsx
import { useEffect, useState } from 'react';
import '../styles/b2bCatalog.css';

export default function B2BCatalog() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí iría la llamada a un endpoint de backend, ej. getProductsMayorista()
    // Para esta etapa asumimos que simplemente tarda medio segundo en simular carga.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="center-container">
        <div className="loader">Cargando catálogo mayorista...</div>
      </div>
    );
  }

  return (
    <section className="catalog-container">
      <h2 className="catalog-title">Catálogo Mayorista</h2>
      <p>
        Bienvenido al espacio de compras al por mayor. Aquí podrás ver precios y
        condiciones especiales para distribuidores y administradores.
      </p>
      {/* A futuro: grid de productos mayoristas */}
      <div className="info-box">
        <p>
          (Aún no hay productos específicos. Esta vista está protegida para roles
          “distributor” y “admin”.)
        </p>
      </div>
    </section>
  );
}
