import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { commitWebpay } from '../services/paymentService';
import '../styles/checkoutSuccess.css';

export default function CheckoutSuccess() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const token_ws = params.get('token_ws');
  const [result, setResult] = useState(null);
  const didCommit = useRef(false);


  useEffect(() => {
    if (!token_ws || didCommit.current) return;
    didCommit.current = true;
    
    (async () => {
      try {
        const { order, commit } = await commitWebpay(token_ws);
        setResult({ order, commit });
      } catch (e) {
        console.error('Error al confirmar pago', e);
      }
    })();
  }, [token_ws]);

  if (!result) return <p className="loading">Confirmando pago…</p>;

  const { order, commit } = result;
  const items = order.items;
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const total = commit.amount; // IVA incluido enviado desde backend

  return (
    <main className="checkout-success-page">
      <div className="checkout-success-card">
        <h2>¡Gracias, {user.username}!</h2>
        <p>Nro de pedido: <strong>{order.id}</strong></p>

        <ul className="success-items-list">
          {items.map((item, i) => (
            <li key={i} className="success-item">
              <img
                src={item.product.image || '/placeholder.png'}
                alt={item.product.name}
                className="item-thumb"
              />
              <div className="item-info">
                <p className="item-name">{item.product.name}</p>
                <p className="item-qty">Cantidad: {item.quantity}</p>
                <p className="item-subtotal">
                  ${ (item.quantity * item.price).toLocaleString('es-CL') } CLP
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="totals">
          <p className="subtotal">Subtotal: ${subtotal.toLocaleString('es-CL')} CLP</p>
          <p className="total">Total: ${total.toLocaleString('es-CL')} CLP</p>
        </div>

        <div className="actions">
          <Link to="/" className="btn btn-primary">Volver al inicio</Link>
          <Link to="/profile" className="btn btn-secondary">Ver mis pedidos</Link>
        </div>
      </div>
    </main>
  );
}
