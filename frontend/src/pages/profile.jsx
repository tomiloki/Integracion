// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile, getUserOrders } from '../services/userService';
import '../styles/profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getUserProfile(), getUserOrders()])
      .then(([userData, ordersData]) => {
        if (mounted) {
          setUser(userData);
          setOrders(ordersData);
        }
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <p className="center-container">Cargando perfil…</p>;
  if (!user) return <p className="center-container error">Error al cargar perfil.</p>;

  console.log('Primer pedido, items:', orders[0].items);

  return (
    <main className="profile-page">
      {/* --- Cabecera de Perfil --- */}
      <section className="profile-header">
        <div className="profile-avatar">
        </div>
        <div className="profile-details">
          <h2>{user.username}</h2>
          <p>{user.email}</p>
          <p>Rol: {user.role}</p>
          <div className="profile-actions">
            <button className="btn-secondary">Configuración</button>
            <button className="btn-secondary">Cambiar contraseña</button>
            <button className="btn-secondary">Cerrar sesión</button>
          </div>
        </div>
      </section>

      {/* --- Zona de Mis Pedidos --- */}
      <section className="orders-section">
        <div className="orders-title">
          <h3>Mis pedidos</h3>
          <input type="text" placeholder="Buscar pedido…" disabled />
        </div>
        <div className="orders-container">
          {orders.map(order => (
            <div key={order.id} className="order-card">
                <h3>Pedido #{order.id}</h3>
                <ul>
                {order.items.map((item, idx) => (
                    <li key={idx} className="order-item">
                    <img
                        src={item.product.image || '/placeholder.png'}
                        alt={item.product.name}
                        className="thumb-small"
                    />
                    {/* ← fíjate que es item.product.name */}
                    <span className="item-name">{item.product.name}</span>
                    <span className="item-qty">x{item.quantity}</span>
                    <span className="item-subtotal">
                        ${ (item.quantity * item.price).toLocaleString('es-CL') } CLP
                    </span>
                    </li>
                ))}
                </ul>
                <p className="order-total">
                <strong>Total:</strong> ${order.total.toLocaleString('es-CL')} CLP
                </p>
                <Link
                    to={`/order/${order.id}`}
                    className="btn-secondary btn-sm btn-outline-primary mt-2 ms-auto d-block"
                    style={{width: 'fit-content'}}
                >
                    Ver detalle
                </Link>
            </div>
            ))}

        </div>
      </section>
    </main>
);
}
