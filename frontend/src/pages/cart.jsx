import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCartItems,
  updateCartItem,
  removeCartItem,
} from '../services/cartService';
import { createOrder } from '../services/orderService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
      .then(data => mounted && setItems(data))
      .catch(() => mounted && setError('No se pudo cargar el carrito.'))
      .finally(() => mounted && setLoading(false));
    return () => void (mounted = false);
  }, []);

  const handleQuantityChange = async (id, qty) => {
    const prev = [...items];
    setItems(items.map(i => i.id === id ? { ...i, quantity: qty } : i));
    try {
      await updateCartItem(id, qty);
    } catch (e) {
      setItems(prev);
      toast.error(e.message || 'Error al actualizar');
    }
  };

  const handleRemove = async id => {
    const prev = [...items];
    setItems(items.filter(i => i.id !== id));
    try {
      await removeCartItem(id);
      toast.success('Artículo eliminado');
    } catch (e) {
      setItems(prev);
      toast.error(e.message || 'Error al eliminar');
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      const order = await createOrder();
      navigate(`/order/${order.id}`, { state: { order } });
    } catch (e) {
      toast.error(e.message || 'Error al crear orden');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="center-container">Cargando carrito…</div>;
  if (error)   return <div className="center-container error">{error}</div>;
  if (items.length === 0) {
    return <div className="center-container">Tu carrito está vacío.</div>;
  }

    // ──────────────────────────────────────────────────────────────
  // Cálculo de IVA
  const subtotal     = items.reduce((sum, i) => sum + i.quantity * i.product.price, 0);
  const taxRate      = 0.19;
  const iva          = subtotal * taxRate;
  const total = subtotal + iva;
  // ──────────────────────────────────────────────────────────────

  return (
    <main className="cart-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="cart-title">Tu Carrito</h2>

      <ul className="cart-list">
        {items.map(item => {
          const { id, quantity, product } = item;
          const subtotal = quantity * product.price;
          return (
            <li key={id} className="cart-item">
              <div
                className="item-info"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  className="item-thumb"
                  src={product.image || '/placeholder.png'}
                  alt={product.name}
                />
                <div className="item-meta">
                  <p className="item-name">{product.name}</p>
                  <p className="item-price">
                    ${product.price.toLocaleString('es-CL')}
                  </p>
                </div>
              </div>

              <div className="item-actions">
                <div className="qty-control">
                  <button
                    onClick={() =>
                      handleQuantityChange(id, Math.max(1, quantity - 1))
                    }
                    disabled={quantity <= 1}
                  >
                    –  
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={quantity}
                    onChange={e =>
                      handleQuantityChange(
                        id,
                        Math.min(
                          product.quantity,
                          Math.max(1, Number(e.target.value))
                        )
                      )
                    }
                  />
                  <button
                    onClick={() =>
                      handleQuantityChange(id, quantity + 1)
                    }
                    disabled={quantity >= product.quantity}
                  >
                    +
                  </button>
                </div>
                <p className="item-subtotal">
                  ${subtotal.toLocaleString('es-CL')}
                </p>
                <button
                  className="btn-remove"
                  onClick={() => handleRemove(id)}
                  aria-label="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="cart-summary">
        <p className="summary-subtotal">
          Subtotal: ${subtotal.toLocaleString('es-CL')} CLP
        </p>
        <p className="summary-total">
          Total: (+ IVA) ${total.toLocaleString('es-CL')} CLP
        </p>
      </div>


      <div className="checkout-actions">
        <button
          className="btn-primary checkout-btn"
          onClick={handleCheckout}
          disabled={processing}
        >
          {processing ? 'Procesando…' : 'Pagar Pedido'}
        </button>
      </div>
    </main>
  );
}
