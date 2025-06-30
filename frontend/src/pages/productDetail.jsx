// src/pages/productDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { addToCart } from '../services/cartService';
import { toast } from 'react-toastify';
import '../styles/productDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProductById(id)
      .then(data => {
        if (!mounted) return;
        setProduct(data);
        if (data.quantity === 0) {
           setQty(0);
         }
      })
      .catch(err => {
        if (!mounted) return;
        if (err.message === 'Producto no encontrado') {
          navigate('/catalog', { replace: true });
        } else {
          setError('Error al cargar el producto.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  if (loading) return <div className="center-container">Cargando producto…</div>;
  if (error)   return <div className="center-container error">{error}</div>;
  if (!product) return null;

  const outOfStock = product.quantity === 0;

  const onQtyChange = e => {
    let v = parseInt(e.target.value, 10) || 1;
    if (v < 1) v = 1;
    if (v > product.quantity) {
      toast.warn(`Solo quedan ${product.quantity} unidades en stock.`);
      v = product.quantity;
    }
    setQty(v);
  };

  const onAdd = async () => {
    try {
      await addToCart(product.id, qty);
      toast.success('¡Agregado al carrito!', { duration: 1000, position: 'bottom-center' });
    } catch (err) {
      toast.error('No se pudo agregar el producto al carrito.', { duration: 1000, position: 'bottom-center' });
    }
  };

  return (
    <main className="product-detail-page">
      <div className="product-detail-card">
        <div className="product-detail-top">
          <div className="product-image">
            {outOfStock && <div className="badge-out">Agotado</div>}
            <div className="image-frame">
              <img src={product.image || '/placeholder.png'} alt={product.name} />
            </div>
          </div>
          <div className="product-info">
            <h1 className="title">{product.name}</h1>
            <p className="sku"><strong>SKU:</strong> {product.sku}</p>
            <p className="category"><strong>Categoría:</strong> {product.category.name}</p>
            <p className="price">${product.price.toLocaleString('es-CL')}</p>
            <p className={`stock ${outOfStock ? 'out' : 'in'}`}>
              {outOfStock ? 'Sin stock' : `En stock: ${product.quantity}`}
            </p>
            <div className="description">
              <h2>Descripción</h2>
              <p>{product.description || 'Sin descripción disponible.'}</p>
            </div>
          </div>
        </div>

        <div className="product-detail-actions">
          <label className="qty-label">
            Cantidad:
            <input
              type="number"
              min="1"
              max={product.quantity}
              value={qty}
              onChange={onQtyChange}
              disabled={outOfStock}
            />
          </label>
          <button
            className="btn-add"
            onClick={onAdd}
            disabled={outOfStock}
          >
            {outOfStock ? 'Agotado' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </main>
  );
}
