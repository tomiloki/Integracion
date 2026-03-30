import React, { useEffect, useMemo, useState } from 'react';

import {
  createAdminCategory,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminProduct,
  getAdminCategories,
  getAdminMetrics,
  getAdminOrders,
  getAdminPayments,
  getAdminProducts,
  getAdminUsers,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
  updateAdminProduct,
  updateAdminUser,
} from '../services/adminService';
import '../styles/adminDashboard.css';

const ORDER_STATUSES = ['pendiente', 'pago_en_proceso', 'completado', 'rechazado', 'cancelado'];
const PAYMENT_STATUSES = ['pendiente', 'iniciada', 'pagado', 'rechazado'];
const USER_ROLES = ['customer', 'distributor', 'admin'];

const INITIAL_PRODUCT_FORM = {
  sku: '',
  brand: '',
  internal_code: '',
  name: '',
  category_id: '',
  price: '',
  quantity: '',
  description: '',
  author: 'admin',
};

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opMessage, setOpMessage] = useState('');

  const [categoryName, setCategoryName] = useState('');
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);
  const [editingProductId, setEditingProductId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [m, productsData, ordersData, paymentsData, usersData, categoriesData] = await Promise.all([
        getAdminMetrics(),
        getAdminProducts(),
        getAdminOrders(),
        getAdminPayments(),
        getAdminUsers(),
        getAdminCategories(),
      ]);
      setMetrics(m);
      setProducts(productsData.results ?? productsData);
      setOrders(ordersData.results ?? ordersData);
      setPayments(paymentsData.results ?? paymentsData);
      setUsers(usersData.results ?? usersData);
      setCategories(categoriesData.results ?? categoriesData);
    } catch {
      setError('No fue posible cargar el backoffice.');
      setMetrics(null);
      setProducts([]);
      setOrders([]);
      setPayments([]);
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

  const showOperationMessage = (message) => {
    setOpMessage(message);
    window.setTimeout(() => setOpMessage(''), 2200);
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(INITIAL_PRODUCT_FORM);
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    if (!categoryName.trim()) return;

    try {
      await createAdminCategory({ name: categoryName.trim() });
      setCategoryName('');
      showOperationMessage('Categoria creada');
      await loadData();
    } catch {
      setError('No fue posible crear la categoria.');
    }
  };

  const handleDeleteCategory = async (category) => {
    const hasProducts = products.some((product) => product.category?.id === category.id);
    if (hasProducts) {
      setError('No se puede eliminar una categoria con productos asociados.');
      return;
    }

    if (!window.confirm(`Eliminar categoria "${category.name}"?`)) return;

    try {
      await deleteAdminCategory(category.id);
      showOperationMessage('Categoria eliminada');
      await loadData();
    } catch {
      setError('No fue posible eliminar la categoria.');
    }
  };

  const handleCreateOrUpdateProduct = async (event) => {
    event.preventDefault();

    const payload = {
      ...productForm,
      category_id: Number(productForm.category_id),
      price: Number(productForm.price),
      quantity: Number(productForm.quantity),
    };

    try {
      if (editingProductId) {
        await updateAdminProduct(editingProductId, payload);
        showOperationMessage('Producto actualizado');
      } else {
        await createAdminProduct(payload);
        showOperationMessage('Producto creado');
      }
      resetProductForm();
      await loadData();
    } catch {
      setError('No fue posible guardar el producto.');
    }
  };

  const startEditProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      sku: product.sku,
      brand: product.brand,
      internal_code: product.internal_code,
      name: product.name,
      category_id: String(product.category?.id || ''),
      price: String(product.price),
      quantity: String(product.quantity),
      description: product.description || '',
      author: product.author || 'admin',
    });
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Eliminar producto "${product.name}"?`)) return;

    try {
      await deleteAdminProduct(product.id);
      showOperationMessage('Producto eliminado');
      if (editingProductId === product.id) resetProductForm();
      await loadData();
    } catch {
      setError('No fue posible eliminar el producto.');
    }
  };

  const handleOrderStatus = async (orderId, nextStatus) => {
    try {
      await updateAdminOrderStatus(orderId, nextStatus);
      showOperationMessage('Estado de orden actualizado');
      await loadData();
    } catch {
      setError('No fue posible actualizar el estado de la orden.');
    }
  };

  const handlePaymentStatus = async (paymentId, nextStatus) => {
    try {
      await updateAdminPaymentStatus(paymentId, nextStatus);
      showOperationMessage('Estado de pago actualizado');
      await loadData();
    } catch {
      setError('No fue posible actualizar el estado del pago.');
    }
  };

  const handleUserRole = async (userId, role) => {
    try {
      await updateAdminUser(userId, { role });
      showOperationMessage('Rol actualizado');
      await loadData();
    } catch {
      setError('No fue posible actualizar el rol.');
    }
  };

  const handleUserActive = async (userId, isActive) => {
    try {
      await updateAdminUser(userId, { is_active: isActive });
      showOperationMessage('Estado de usuario actualizado');
      await loadData();
    } catch {
      setError('No fue posible actualizar el estado del usuario.');
    }
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
        <p>Gestiona catalogo, pedidos, pagos y usuarios desde una sola vista.</p>
      </section>

      {opMessage && <p className="admin-op-message">{opMessage}</p>}

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
            {categories.map((category) => {
              const hasProducts = products.some((product) => product.category?.id === category.id);
              return (
                <li key={category.id}>
                  <span>{category.name}</span>
                  <button
                    type="button"
                    className="btn-ghost btn-mini"
                    disabled={hasProducts}
                    onClick={() => handleDeleteCategory(category)}
                    title={hasProducts ? 'Tiene productos asociados' : 'Eliminar categoria'}
                  >
                    Eliminar
                  </button>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="admin-card">
          <h2>{editingProductId ? `Editar producto #${editingProductId}` : 'Nuevo producto'}</h2>
          <form onSubmit={handleCreateOrUpdateProduct} className="admin-form grid-form">
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
            <div className="form-actions-row">
              <button className="btn-primary" type="submit">{editingProductId ? 'Guardar cambios' : 'Crear producto'}</button>
              {editingProductId && (
                <button type="button" className="btn-secondary" onClick={resetProductForm}>Cancelar edicion</button>
              )}
            </div>
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
                <th>Acciones</th>
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
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn-secondary btn-mini" onClick={() => startEditProduct(product)}>
                        Editar
                      </button>
                      <button type="button" className="btn-ghost btn-mini" onClick={() => handleDeleteProduct(product)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
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
        <h2>Gestion de pagos</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID Pago</th>
                <th>Orden</th>
                <th>Usuario</th>
                <th>Monto</th>
                <th>Metodo</th>
                <th>Estado</th>
                <th>Actualizar</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>#{payment.order_id}</td>
                  <td>{payment.username || '-'}</td>
                  <td>${Math.round(payment.amount).toLocaleString('es-CL')}</td>
                  <td>{payment.method}</td>
                  <td>{payment.status}</td>
                  <td>
                    <select
                      value={payment.status}
                      onChange={(event) => handlePaymentStatus(payment.id, event.target.value)}
                    >
                      {PAYMENT_STATUSES.map((status) => (
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
                    <select value={user.role} onChange={(event) => handleUserRole(user.id, event.target.value)}>
                      {USER_ROLES.map((nextRole) => (
                        <option key={nextRole} value={nextRole}>{nextRole}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={user.is_active ? 'true' : 'false'}
                      onChange={(event) => handleUserActive(user.id, event.target.value === 'true')}
                    >
                      <option value="true">Si</option>
                      <option value="false">No</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
