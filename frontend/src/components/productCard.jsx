import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../services/cartService';
import { toast } from 'react-toastify';
import '../styles/productCard.css';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const outOfStock = product.quantity === 0;

  const handleViewDetail = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      toast.success('¡Agregado al carrito!', { duration: 1000, position: 'bottom-center' });
    } catch (err) {
      toast.error('No se pudo agregar el producto al carrito.', { duration: 1000, position: 'bottom-center' });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={`product-card ${outOfStock ? 'sold-out' : ''}`}>
      <div className="badge">{product.category.name}</div>

      {/* Overlay solo visual, sin capturar clicks */}
      {outOfStock && <div className="overlay" aria-hidden="true">Agotado</div>}

      <div className="image-container">
        <img
          src={product.image || '/placeholder.png'}
          alt={product.name}
        />
      </div>

      <h3 className="product-name">{product.name}</h3>
      <p className="product-sku">SKU: {product.sku}</p>
      <p className="product-price">
        ${Math.round(product.price).toLocaleString('es-CL')}
      </p>
      <p className={`product-stock ${outOfStock ? 'out' : 'in'}`}>
        {outOfStock
          ? 'Sin stock'
          : `En stock: ${product.quantity}`}
      </p>

      <div className="card-actions">
        <button
          className="btn-secondary detail-btn"
          onClick={handleViewDetail}
        >
          Ver detalle
        </button>
        <button
          className="btn-primary"
          onClick={handleAddToCart}
          disabled={outOfStock || adding}
          title={
            outOfStock
              ? 'No disponible en stock'
              : adding
              ? 'Agregando…'
              : 'Agregar al carrito'
          }
        >
          {adding
            ? 'Agregando…'
            : outOfStock
            ? 'Agotado'
            : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}
