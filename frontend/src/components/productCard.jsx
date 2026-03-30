import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import { addToCart } from '../services/cartService';
import '../styles/productCard.css';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const feedbackTimerRef = useRef(null);
  const outOfStock = product.quantity <= 0;

  const priceToDisplay = useMemo(() => {
    if (typeof product.effective_price === 'number') {
      return product.effective_price;
    }
    return Number(product.price);
  }, [product]);

  const priceLabel = product.is_b2b_price ? 'Precio mayorista' : 'Precio';

  const handleViewDetail = () => {
    navigate(`/product/${product.id}`);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const setTransientFeedback = (type, message) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setFeedback({ type, message });
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 2300);
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
      setTransientFeedback('success', 'Producto agregado al carrito');
    } catch (err) {
      setTransientFeedback('error', 'No se pudo agregar al carrito');
      toast.error(err?.message || 'No se pudo agregar el producto al carrito.', {
        toastId: `cart-add-error-${product.id}`,
      });
    }
  };

  return (
    <motion.article
      className={`product-card ${outOfStock ? 'sold-out' : ''}`}
      data-testid={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.25 }}
    >
      <p className="badge">{product.category.name}</p>
      {outOfStock && <div className="overlay" aria-hidden="true">Agotado</div>}

      <div className="image-container">
        <img src={product.image || '/logo192.png'} alt={product.name} loading="lazy" width="480" height="360" />
      </div>

      <h3 className="product-name">{product.name}</h3>
      <p className="product-sku">SKU: {product.sku}</p>
      <p className="product-price-label">{priceLabel}</p>
      <p className="product-price">${Math.round(priceToDisplay).toLocaleString('es-CL')}</p>
      <p className={`product-stock ${outOfStock ? 'out' : 'in'}`}>
        {outOfStock ? 'Sin stock' : `Stock disponible: ${product.quantity}`}
      </p>

      <div className="card-actions">
        <button
          type="button"
          className="btn-secondary detail-btn"
          onClick={handleViewDetail}
          data-testid={`product-detail-btn-${product.id}`}
        >
          Ver detalle
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleAddToCart}
          disabled={outOfStock}
          data-testid={`product-add-btn-${product.id}`}
        >
          {outOfStock ? 'Agotado' : 'Agregar'}
        </button>
      </div>
      {feedback && (
        <p className={`cart-feedback ${feedback.type}`} role="status" aria-live="polite">
          {feedback.message}
        </p>
      )}
    </motion.article>
  );
}

