import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { initWebpay } from '../services/paymentService';
import { getOrderById } from '../services/orderService';
import '../styles/orderSummary.css';

const PAYABLE_STATUSES = ['pendiente', 'pago_en_proceso'];

export default function OrderSummary() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;
    getOrderById(id)
      .then((data) => {
        if (mounted) setOrder(data);
      })
      .catch(() => {
        if (mounted) setError('No se encontro la orden solicitada.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const totals = useMemo(() => {
    if (!order) return { subtotal: 0, total: 0 };
    const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const total = order.total_with_tax || subtotal * 1.19;
    return { subtotal, total };
  }, [order]);

  const handlePayment = async () => {
    if (!order) return;
    setProcessing(true);
    try {
      const { url, token } = await initWebpay(order.id);
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'token_ws';
      input.value = token;
      form.appendChild(input);

      document.body.appendChild(form);
      form.submit();
    } catch {
      setError('No fue posible iniciar el pago Webpay.');
      setProcessing(false);
    }
  };

  if (loading) return <p className="state-panel">Cargando orden...</p>;
  if (error) {
    return (
      <div className="state-panel error" role="status">
        <p>{error}</p>
        <Link to="/cart" className="btn-secondary">Volver al carrito</Link>
      </div>
    );
  }
  if (!order) return null;

  const formattedDate = new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(order.created_at));

  return (
    <main className="page-shell order-summary-page fade-in-up">
      <article className="order-summary-card">
        <header className="order-header">
          <div>
            <p className="order-label">Orden #{order.id}</p>
            <h1>Resumen de Compra</h1>
            <p className="order-date">Emitida el {formattedDate}</p>
          </div>
          <p className={`order-status status-${order.status}`}>{order.status}</p>
        </header>

        <ul className="order-items-list" data-testid="order-items-list">
          {order.items.map((item, index) => {
            const itemSubtotal = item.quantity * item.price;
            return (
              <li key={`${item.product.id}-${index}`} className="order-item">
                <img
                  src={item.product.image || '/logo192.png'}
                  alt={item.product.name}
                  className="thumb-small"
                  loading="lazy"
                />
                <div className="item-details">
                  <p className="item-name">{item.product.name}</p>
                  <p className="item-sku">SKU: {item.product.sku}</p>
                </div>
                <div className="item-qty">
                  ${item.price.toLocaleString('es-CL')} x {item.quantity}
                </div>
                <div className="item-subtotal">${itemSubtotal.toLocaleString('es-CL')}</div>
              </li>
            );
          })}
        </ul>

        <div className="order-total" data-testid="order-total">
          <p>Subtotal: ${totals.subtotal.toLocaleString('es-CL')} CLP</p>
          <p className="total-line">Total (+ IVA): ${totals.total.toLocaleString('es-CL')} CLP</p>
        </div>

        <footer className="order-actions">
          {PAYABLE_STATUSES.includes(order.status) ? (
            <button
              type="button"
              className="btn-primary"
              onClick={handlePayment}
              disabled={processing}
              data-testid="order-pay-webpay-btn"
            >
              {processing ? 'Redirigiendo...' : 'Pagar con Webpay'}
            </button>
          ) : (
            <p className="payment-status">Este pedido ya no requiere pago adicional.</p>
          )}

          <Link to="/profile" className="btn-secondary">Ver historial</Link>
          <Link to="/" className="btn-ghost">Volver al inicio</Link>
        </footer>
      </article>
    </main>
  );
}

