import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getCartItems, removeCartItem, updateCartItem } from '../services/cartService';
import { createOrder } from '../services/orderService';
import '../styles/cart.css';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getCartItems()
      .then((data) => {
        if (mounted) setItems(data);
      })
      .catch(() => {
        if (mounted) setError('No se pudo cargar el carrito.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleQuantityChange = async (id, qty) => {
    const previous = [...items];
    setItems(items.map((item) => (item.id === id ? { ...item, quantity: qty } : item)));
    try {
      await updateCartItem(id, qty);
    } catch (err) {
      setItems(previous);
      toast.error(err.message || 'Error al actualizar cantidad.');
    }
  };

  const handleRemove = async (id) => {
    const previous = [...items];
    setItems(items.filter((item) => item.id !== id));
    try {
      await removeCartItem(id);
      toast.success('Articulo eliminado.');
    } catch (err) {
      setItems(previous);
      toast.error(err.message || 'Error al eliminar articulo.');
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      const order = await createOrder();
      navigate(`/order/${order.id}`, { state: { order } });
    } catch (err) {
      toast.error(err.message || 'No se pudo crear la orden.');
    } finally {
      setProcessing(false);
    }
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
    [items]
  );
  const taxRate = 0.19;
  const total = subtotal + subtotal * taxRate;

  if (loading) {
    return (
      <section className="page-shell cart-page" aria-hidden="true">
        <div className="cart-skeleton skeleton" />
        <div className="cart-skeleton skeleton" />
      </section>
    );
  }

  if (error) return <p className="state-panel error">{error}</p>;

  if (items.length === 0) {
    return (
      <div className="state-panel">
        <p>Tu carrito esta vacio por ahora.</p>
        <Link to="/catalog" className="btn-secondary">Ir al catalogo</Link>
      </div>
    );
  }

  return (
    <main className="page-shell cart-page fade-in-up">
      <ToastContainer position="top-right" autoClose={2800} pauseOnHover />

      <header className="cart-header">
        <h1>Carrito de Compra</h1>
        <p>Revisa cantidades y continua al pago cuando estes listo.</p>
      </header>

      <div className="cart-layout">
        <ul className="cart-list" data-testid="cart-list">
          {items.map((item) => {
            const { id, quantity, product } = item;
            const itemSubtotal = quantity * product.price;

            return (
              <li key={id} className="cart-item" data-testid={`cart-item-${id}`}>
                <button
                  type="button"
                  className="item-info"
                  onClick={() => navigate(`/product/${product.id}`)}
                  aria-label={`Ver detalle de ${product.name}`}
                >
                  <img className="item-thumb" src={product.image || '/logo192.png'} alt={product.name} loading="lazy" />
                  <div className="item-meta">
                    <p className="item-name">{product.name}</p>
                    <p className="item-price">${product.price.toLocaleString('es-CL')}</p>
                  </div>
                </button>

                <div className="item-actions">
                  <div className="qty-control">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(id, Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      data-testid={`cart-qty-decrease-${id}`}
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={quantity}
                      onChange={(event) =>
                        handleQuantityChange(id, Math.min(product.quantity, Math.max(1, Number(event.target.value))))
                      }
                      data-testid={`cart-qty-input-${id}`}
                      aria-label="Cantidad"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(id, quantity + 1)}
                      disabled={quantity >= product.quantity}
                      data-testid={`cart-qty-increase-${id}`}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  <p className="item-subtotal">${itemSubtotal.toLocaleString('es-CL')}</p>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemove(id)}
                    aria-label="Eliminar"
                    data-testid={`cart-remove-${id}`}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="cart-summary-panel">
          <h2>Resumen</h2>
          <p className="summary-subtotal">Subtotal: ${subtotal.toLocaleString('es-CL')} CLP</p>
          <p className="summary-tax">IVA (19%): ${(subtotal * taxRate).toLocaleString('es-CL')} CLP</p>
          <p className="summary-total">Total: ${total.toLocaleString('es-CL')} CLP</p>

          <button
            type="button"
            className="btn-primary checkout-btn"
            onClick={handleCheckout}
            disabled={processing}
            data-testid="cart-checkout-btn"
          >
            {processing ? 'Preparando pago...' : 'Ir al pago'}
          </button>
        </aside>
      </div>
    </main>
  );
}

