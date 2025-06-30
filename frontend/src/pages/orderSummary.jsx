// src/pages/OrderSummary.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import { initWebpay } from '../services/paymentService';
import '../styles/orderSummary.css';

export default function OrderSummary() {
  const { id } = useParams();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [processing] = useState(false);

  useEffect(() => {
    let mounted = true;
    getOrderById(id)
      .then(data => mounted && setOrder(data))
      .catch(() => mounted && setError('No se encontró la orden.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="center-container">Cargando orden…</div>;
  if (error)   return (
    <div className="center-container error">
      {error} — <Link to="/cart">Volver al carrito</Link>
    </div>
  );
  if (!order) return null;

  const formattedDate = new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'long', timeStyle: 'short'
  }).format(new Date(order.created_at));

  const subtotal = order.items.reduce((sum, itm) => sum + itm.quantity * itm.price, 0);
  const total = subtotal * 1.19;

const handlePayment = async () => {
  try {
    // 1) Inicializas en tu backend
    const { url, token } = await initWebpay(order.id);

    // 2) Generas dinámicamente un <form> y lo submites por POST:
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
  
    const input = document.createElement('input');
    input.type  = 'hidden';
    input.name  = 'token_ws';
    input.value = token;
    form.appendChild(input);
  
    document.body.appendChild(form);
    form.submit();
  } catch (err) {
    console.error(err);
    alert('Error al iniciar Webpay');
  }
};


  return (
    <main className="order-summary-page">
      <div className="order-summary-card">
        <header className="order-header">
          <h2>Pedido #{order.id}</h2>
          <p className="order-date">Fecha: {formattedDate}</p>
        </header>

        <ul className="order-items-list">
          {order.items.map((item, idx) => {
            const subtotal = item.quantity * item.price;
            return (
              <li key={idx} className="order-item">
                <img
                  src={item.product.image || '/placeholder.png'}
                  alt={item.product.name}
                  className="thumb-small"
                />
                <div className="item-details">
                  <p className="item-name">{item.product.name}</p>
                  <p className="item-sku">SKU: {item.product.sku}</p>
                </div>
                <div className="item-qty">
                  ${item.price.toLocaleString('es-CL')} × {item.quantity}
                </div>
                <div className="item-subtotal">
                  ${subtotal.toLocaleString('es-CL')}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="order-total">
          <span>Total (+ IVA): </span>
          <span>${total.toLocaleString('es-CL')} CLP</span>
        </div>

        {order.status === 'pendiente' ? (
          <section className="order-payments">
            <button
              className="btn-primary"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? 'Redirigiendo…' : 'Pagar con Webpay'}
            </button>
          </section>
        ) : (
          <p className="payment-status">
            Estado de pago: <strong>{order.status}</strong>
          </p>
        )}

        <Link to="/" className="btn-secondary back-home">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

