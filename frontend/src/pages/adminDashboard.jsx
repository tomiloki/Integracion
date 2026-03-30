import React, { useEffect, useMemo, useState } from 'react';

import {
  createAdminCategory,
  createAdminProduct,
  getAdminCategories,
  getAdminMetrics,
  getAdminOrders,
  getAdminProducts,
  getAdminUsers,
  updateAdminOrderStatus,
  updateAdminUser,
} from '../services/adminService';
import '../styles/adminDashboard.css';

const ORDER_STATUSES = ['pendiente', 'pago_en_proceso', 'completado', 'rechazado', 'cancelado'];
const USER_ROLES = ['customer', 'distributor', 'admin'];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categoryName, setCategoryName] = useState('');
  const [productForm, setProductForm] = useState({
    sku: '',
    brand: '',
    internal_code: '',
    name: '',
    category_id: '',
    price: '',
    quantity: '',
    description: '',
    author: 'admin',
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [m, productsData, ordersData, usersData, categoriesData] = await Promise.all([
        getAdminMetrics(),
        getAdminProducts(),
        getAdminOrders(),
        getAdminUsers(),
        getAdminCategories(),
      ]);
      setMetrics(m);
      setProducts(productsData.results ?? productsData);
      setOrders(ordersData.results ?? ordersData);
      setUsers(usersData.results ?? usersData);
      setCategories(categoriesData.results ?? categoriesData);
    } catch {
      setError('No fue posible cargar el backoffice.');
      setMetrics(null);
      setProducts([]);
      setOrders([]);
      setUsers([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summaryCards = useMemo(() => {
    if (!metrics) return [];
    return [
      { label: 'Ordenes totales', value: metrics.orders_total },
      { label: 'Pendientes', value: metrics.orders_pending },
      { label: 'Completadas', value: metrics.orders_completed },
      { label: 'Stock critico', value: metrics.stock_critical },
      { label: 'Ingresos', value: `$${Math.round(metrics.revenue_paid || 0).toLocaleString('es-CL')}` },
    ];
  }, [metrics]);

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    if (!categoryName.trim()) return;
    await createAdminCategory({ name: categoryName.trim() });
    setCategoryName('');
    await loadData();
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    await createAdminProduct({
      ...productForm,
      price: Number(productForm.price),
      quantity: Number(productForm.quantity),
    });

    setProductForm({
      sku: '',
      brand: '',
      internal_code: '',
      name: '',
      category_id: '',
      price: '',
      quantity: '',
      description: '',
      author: 'admin',
    });
    await loadData();
  };

  const handleOrderStatus = async (orderId, nextStatus) => {
    await updateAdminOrderStatus(orderId, nextStatus);
    await loadData();
  };

  const handleUserRole = async (userId, role) => {
    await updateAdminUser(userId, { role });
    await loadData();
  };

  if (loading) {
    return (
      <section className="page-shell admin-page" aria-hidden="true">
        <div className="admin-skeleton skeleton" />
        <div className="admin-skeleton skeleton" />
      </section>
    );
  }

  if (error) {
    return (
      <div className="state-panel error">
        <p>{error}</p>
        <button type="button" className="btn-secondary" onClick={loadData}>Reintentar</button>
      </div>
    );
  }

  return (
    <main className="page-shell admin-page fade-in-up">
      <section className="admin-hero">
        <p className="admin-kicker">Backoffice operativo</p>
        <h1>Control Central AutoParts</h1>
        <p>Gestiona catalogo, pedidos, usuarios y estado comercial desde una sola vista.</p>
      </section>

      <section className="admin-grid metrics-grid" aria-label="Metricas principales">
        {summaryCards.map((card) => (
          <article key={card.label} className="metric-card">
            <p>{card.label}</p>
            <h3>{card.value}</h3>
          </article>
        ))}
      </section>

      <section className="admin-grid two-columns">
        <article className="admin-card">
          <h2>Nueva categoria</h2>
          <form onSubmit={handleCreateCategory} className="admin-form">
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="Nombre de categoria"
              required
            />
            <button className="btn-primary" type="submit">Crear categoria</button>
          </form>

          <ul className="simple-list">
            {categories.map((category) => (
              <li key={category.id}>{category.name}</li>
            ))}
          </ul>
        </article>

        <article className="admin-card">
          <h2>Nuevo producto</h2>
          <form onSubmit={handleCreateProduct} className="admin-form grid-form">
            <input placeholder="SKU" value={productForm.sku} onChange={(event) => setProductForm((prev) => ({ ...prev, sku: event.target.value }))} required />
            <input placeholder="Marca" value={productForm.brand} onChange={(event) => setProductForm((prev) => ({ ...prev, brand: event.target.value }))} required />
            <input placeholder="Codigo interno" value={productForm.internal_code} onChange={(event) => setProductForm((prev) => ({ ...prev, internal_code: event.target.value }))} required />
            <input placeholder="Nombre" value={productForm.name} onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))} required />
            <select value={productForm.category_id} onChange={(event) => setProductForm((prev) => ({ ...prev, category_id: event.target.value }))} required>
              <option value="">Categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input type="number" min="0" placeholder="Precio" value={productForm.price} onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))} required />
            <input type="number" min="0" placeholder="Stock" value={productForm.quantity} onChange={(event) => setProductForm((prev) => ({ ...prev, quantity: event.target.value }))} required />
            <input placeholder="Autor" value={productForm.author} onChange={(event) => setProductForm((prev) => ({ ...prev, author: event.target.value }))} required />
            <textarea placeholder="Descripcion" value={productForm.description} onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))} />
            <button className="btn-primary" type="submit">Crear producto</button>
          </form>
        </article>
      </section>

      <section className="admin-card">
        <h2>Catalogo actual</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Categoria</th>
                <th>Precio</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.category?.name || '-'}</td>
                  <td>${Math.round(product.price).toLocaleString('es-CL')}</td>
                  <td>{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <h2>Gestion de pedidos</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Actualizar</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.user?.username || '-'}</td>
                  <td>{order.status}</td>
                  <td>${Math.round(order.total).toLocaleString('es-CL')}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(event) => handleOrderStatus(order.id, event.target.value)}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <h2>Gestion de usuarios</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(event) => handleUserRole(user.id, event.target.value)}
                    >
                      {USER_ROLES.map((nextRole) => (
                        <option key={nextRole} value={nextRole}>{nextRole}</option>
                      ))}
                    </select>
                  </td>
                  <td>{user.is_active ? 'Si' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

