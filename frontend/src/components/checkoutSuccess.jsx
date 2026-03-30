import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useAuth } from '../context/authContext';
import { commitWebpay } from '../services/paymentService';
import '../styles/checkoutSuccess.css';

export default function CheckoutSuccess() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const tokenWs = params.get('token_ws');
  const cancelled = params.get('cancelled') === '1';
  const tbkToken = params.get('tbk_token') || params.get('TBK_TOKEN');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const didCommit = useRef(false);

  useEffect(() => {
    if (!tokenWs || didCommit.current) return;
    didCommit.current = true;

    commitWebpay(tokenWs)
      .then((payload) => setResult(payload))
      .catch(() => setError('No fue posible confirmar el pago con Webpay.'));
  }, [tokenWs]);

  if (cancelled) {
    return (
      <main className="page-shell checkout-success-page">
        <div className="checkout-success-card">
          <h1>Pago cancelado</h1>
          <p>La transaccion fue cancelada o expiro antes de confirmarse.</p>
          {tbkToken && <p className="subtotal">Referencia Webpay: {tbkToken}</p>}
          <div className="actions">
            <Link to="/profile" className="btn-secondary">Volver a pedidos</Link>
            <Link to="/cart" className="btn-primary">Regresar al carrito</Link>
          </div>
        </div>
      </main>
    );
  }

  if (!tokenWs) {
    return <p className="state-panel error">No se encontro token de pago.</p>;
  }

  if (error) {
    return (
      <main className="page-shell checkout-success-page">
        <div className="checkout-success-card">
          <h1>Pago no confirmado</h1>
          <p>{error}</p>
          <Link to="/profile" className="btn-secondary">Volver a mis pedidos</Link>
        </div>
      </main>
    );
  }

  if (!result) return <p className="state-panel">Confirmando pago...</p>;

  const { order, commit } = result;
  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const total = commit.amount || subtotal;

  return (
    <main className="page-shell checkout-success-page fade-in-up">
      <article className="checkout-success-card">
        <header>
          <p className="success-kicker">Pago confirmado</p>
          <h1>Gracias{user?.username ? `, ${user.username}` : ''}</h1>
          <p>Pedido #{order.id} procesado correctamente.</p>
        </header>

        <ul className="success-items-list">
          {items.map((item, index) => (
            <li key={`${item.product.id}-${index}`} className="success-item">
              <img src={item.product.image || '/logo192.png'} alt={item.product.name} className="item-thumb" loading="lazy" />
              <div className="item-info">
                <p className="item-name">{item.product.name}</p>
                <p className="item-qty">Cantidad: {item.quantity}</p>
              </div>
              <p className="item-subtotal">${(item.quantity * item.price).toLocaleString('es-CL')} CLP</p>
            </li>
          ))}
        </ul>

        <div className="totals">
          <p className="subtotal">Subtotal: ${subtotal.toLocaleString('es-CL')} CLP</p>
          <p className="total">Total: ${Number(total).toLocaleString('es-CL')} CLP</p>
        </div>

        <div className="actions">
          <Link to="/" className="btn-secondary">Volver al inicio</Link>
          <Link to="/profile" className="btn-primary">Ver mis pedidos</Link>
        </div>
      </article>
    </main>
  );
}

