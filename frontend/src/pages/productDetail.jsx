import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

import { addToCart } from '../services/cartService';
import { getProductById } from '../services/productService';
import '../styles/productDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addFeedback, setAddFeedback] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getProductById(id)
      .then((data) => {
        if (!mounted) return;
        setProduct(data);
        if (data.quantity <= 0) setQty(0);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err.message === 'Producto no encontrado') {
          navigate('/catalog', { replace: true });
        } else {
          setError('No fue posible cargar el detalle del producto.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const outOfStock = useMemo(() => (product?.quantity || 0) <= 0, [product]);

  const onQtyChange = (event) => {
    if (!product) return;
    let value = Number.parseInt(event.target.value, 10) || 1;
    if (value < 1) value = 1;
    if (value > product.quantity) {
      value = product.quantity;
      toast.warn(`Stock maximo disponible: ${product.quantity}`, {
        toastId: `detail-stock-max-${product.id}`,
      });
    }
    setQty(value);
  };

  const onAdd = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, qty);
      setAddFeedback({ type: 'success', text: 'Producto agregado al carrito' });
      setTimeout(() => setAddFeedback(null), 2300);
    } catch (err) {
      setAddFeedback({ type: 'error', text: 'No se pudo agregar al carrito' });
      setTimeout(() => setAddFeedback(null), 2300);
      toast.error(err?.message || 'No fue posible agregar este producto al carrito.', {
        toastId: `detail-add-error-${product.id}`,
      });
    }
  };

  if (loading) {
    return (
      <section className="page-shell product-detail-loading" aria-hidden="true">
        <div className="skeleton product-detail-skeleton-media" />
        <div className="skeleton product-detail-skeleton-copy" />
      </section>
    );
  }

  if (error) return <p className="state-panel error">{error}</p>;
  if (!product) return null;

  return (
    <main className="page-shell product-detail-page fade-in-up">
      <button type="button" className="btn-ghost detail-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} aria-hidden="true" /> Volver
      </button>

      <article className="product-detail-layout">
        <div className="product-media-wrap">
          {outOfStock && <p className="badge-out">Sin stock</p>}
          <img
            src={product.image || '/logo192.png'}
            alt={product.name}
            loading="eager"
            width="900"
            height="720"
          />
        </div>

        <section className="product-info">
          <p className="meta-line">{product.category.name}</p>
          <h1 className="title">{product.name}</h1>
          <p className="sku">SKU: {product.sku}</p>
          <p className="price">${Number(product.price).toLocaleString('es-CL')} CLP</p>
          <p className={`stock ${outOfStock ? 'out' : 'in'}`}>
            {outOfStock ? 'Estado: agotado' : `Stock disponible: ${product.quantity}`}
          </p>

          <div className="description">
            <h2>Descripcion tecnica</h2>
            <p>{product.description || 'Producto sin descripcion extendida.'}</p>
          </div>

          <div className="product-detail-actions">
            <label htmlFor="qty" className="qty-label">Cantidad</label>
            <input
              id="qty"
              type="number"
              min="1"
              max={product.quantity}
              value={qty}
              onChange={onQtyChange}
              disabled={outOfStock}
              data-testid="product-detail-qty"
            />
            <button
              type="button"
              className="btn-primary btn-add"
              onClick={onAdd}
              disabled={outOfStock}
              data-testid="product-detail-add-to-cart"
            >
              {outOfStock ? 'Agotado' : 'Agregar al carrito'}
            </button>
          </div>
          {addFeedback && (
            <p className={`detail-feedback ${addFeedback.type}`} role="status" aria-live="polite">
              {addFeedback.text}
            </p>
          )}
        </section>
      </article>
    </main>
  );
}

