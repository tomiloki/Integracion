import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/authContext';
import { getUserOrders, getUserProfile } from '../services/userService';
import '../styles/profile.css';

export default function Profile() {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([getUserProfile(), getUserOrders()])
      .then(([userData, orderData]) => {
        if (!mounted) return;
        setUser(userData);
        setOrders(orderData || []);
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
        setOrders([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const orderStats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((order) => order.status === 'completado').length;
    return { total, completed };
  }, [orders]);

  if (loading) {
    return (
      <section className="page-shell profile-page" aria-hidden="true">
        <div className="profile-skeleton skeleton" />
        <div className="profile-skeleton skeleton" />
      </section>
    );
  }

  if (!user) return <p className="state-panel error">Error al cargar perfil.</p>;

  return (
    <main className="page-shell profile-page fade-in-up">
      <section className="profile-header" data-testid="profile-header">
        <div className="profile-avatar" aria-hidden="true">
          {user.username?.slice(0, 2).toUpperCase()}
        </div>

        <div className="profile-details">
          <h1 data-testid="profile-username">{user.username}</h1>
          <p>{user.email}</p>
          <p>Rol: <strong>{user.role}</strong></p>
        </div>

        <div className="profile-actions">
          <button className="btn-secondary" type="button" onClick={logout} data-testid="profile-logout-btn">
            Cerrar sesion
          </button>
        </div>
      </section>

      <section className="orders-summary">
        <p>Pedidos totales: <strong>{orderStats.total}</strong></p>
        <p>Completados: <strong>{orderStats.completed}</strong></p>
      </section>

      <section className="orders-section">
        <h2>Historial de pedidos</h2>

        {orders.length === 0 ? (
          <p className="state-panel">Aun no tienes pedidos. Explora el catalogo para comenzar.</p>
        ) : (
          <div className="orders-container" data-testid="profile-orders-list">
            {orders.map((order) => (
              <article key={order.id} className="order-card" data-testid={`profile-order-${order.id}`}>
                <header>
                  <h3>Pedido #{order.id}</h3>
                  <p className={`status status-${order.status}`}>{order.status}</p>
                </header>

                <ul>
                  {order.items.map((item, index) => (
                    <li key={`${item.product.id}-${index}`} className="order-item">
                      <img src={item.product.image || '/logo192.png'} alt={item.product.name} className="thumb-small" />
                      <span className="item-name">{item.product.name}</span>
                      <span className="item-qty">x{item.quantity}</span>
                      <span className="item-subtotal">${(item.quantity * item.price).toLocaleString('es-CL')} CLP</span>
                    </li>
                  ))}
                </ul>

                <footer>
                  <p className="order-total">
                    Total: <strong>${order.total.toLocaleString('es-CL')} CLP</strong>
                  </p>
                  <Link to={`/order/${order.id}`} className="btn-secondary">Ver detalle</Link>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

