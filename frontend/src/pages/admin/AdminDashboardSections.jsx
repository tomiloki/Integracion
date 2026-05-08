import React from 'react';

import { ORDER_STATUSES, PAYMENT_STATUSES, USER_ROLES } from './useAdminDashboard';

function productCategoryId(product) {
  return product.category?.id ?? product.category ?? '';
}

export function AdminHero({ opMessage }) {
  return (
    <>
      <section className="admin-hero">
        <p className="admin-kicker">Backoffice operativo</p>
        <h1>Control Central AutoParts</h1>
        <p>Gestiona catalogo, pedidos, pagos y usuarios desde una sola vista.</p>
      </section>
      {opMessage && <p className="admin-op-message">{opMessage}</p>}
    </>
  );
}

export function MetricsGrid({ cards }) {
  return (
    <section className="admin-grid metrics-grid" aria-label="Metricas principales">
      {cards.map((card) => (
        <article key={card.label} className="metric-card">
          <p>{card.label}</p>
          <h3>{card.value}</h3>
        </article>
      ))}
    </section>
  );
}

export function CategoryManager({ categories, categoryName, onCategoryNameChange, onCreateCategory, onDeleteCategory, products }) {
  return (
    <article className="admin-card">
      <h2>Nueva categoria</h2>
      <form onSubmit={onCreateCategory} className="admin-form">
        <input
          value={categoryName}
          onChange={(event) => onCategoryNameChange(event.target.value)}
          placeholder="Nombre de categoria"
          required
        />
        <button className="btn-primary" type="submit">Crear categoria</button>
      </form>

      <ul className="simple-list">
        {categories.map((category) => {
          const hasProducts = products.some((product) => productCategoryId(product) === category.id);
          return (
            <li key={category.id}>
              <span>{category.name}</span>
              <button
                type="button"
                className="btn-ghost btn-mini"
                disabled={hasProducts}
                onClick={() => onDeleteCategory(category)}
                title={hasProducts ? 'Tiene productos asociados' : 'Eliminar categoria'}
              >
                Eliminar
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export function ProductForm({ categories, editingProductId, form, onCancel, onChange, onSubmit }) {
  return (
    <article className="admin-card">
      <h2>{editingProductId ? `Editar producto #${editingProductId}` : 'Nuevo producto'}</h2>
      <form onSubmit={onSubmit} className="admin-form grid-form">
        <input placeholder="SKU" value={form.sku} onChange={(event) => onChange((prev) => ({ ...prev, sku: event.target.value }))} required />
        <input placeholder="Marca" value={form.brand} onChange={(event) => onChange((prev) => ({ ...prev, brand: event.target.value }))} required />
        <input placeholder="Codigo interno" value={form.internal_code} onChange={(event) => onChange((prev) => ({ ...prev, internal_code: event.target.value }))} required />
        <input placeholder="Nombre" value={form.name} onChange={(event) => onChange((prev) => ({ ...prev, name: event.target.value }))} required />
        <select value={form.category_id} onChange={(event) => onChange((prev) => ({ ...prev, category_id: event.target.value }))} required>
          <option value="">Categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <input type="number" min="0" placeholder="Precio" value={form.price} onChange={(event) => onChange((prev) => ({ ...prev, price: event.target.value }))} required />
        <input type="number" min="0" placeholder="Stock" value={form.quantity} onChange={(event) => onChange((prev) => ({ ...prev, quantity: event.target.value }))} required />
        <input placeholder="Autor" value={form.author} onChange={(event) => onChange((prev) => ({ ...prev, author: event.target.value }))} required />
        <textarea placeholder="Descripcion" value={form.description} onChange={(event) => onChange((prev) => ({ ...prev, description: event.target.value }))} />
        <div className="form-actions-row">
          <button className="btn-primary" type="submit">{editingProductId ? 'Guardar cambios' : 'Crear producto'}</button>
          {editingProductId && (
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar edicion</button>
          )}
        </div>
      </form>
    </article>
  );
}

export function ProductTable({ onDeleteProduct, onEditProduct, products }) {
  return (
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
                    <button type="button" className="btn-secondary btn-mini" onClick={() => onEditProduct(product)}>
                      Editar
                    </button>
                    <button type="button" className="btn-ghost btn-mini" onClick={() => onDeleteProduct(product)}>
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
  );
}

export function OrdersTable({ onStatusChange, orders }) {
  return (
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
                  <select value={order.status} onChange={(event) => onStatusChange(order.id, event.target.value)}>
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
  );
}

export function PaymentsTable({ onStatusChange, payments }) {
  return (
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
                  <select value={payment.status} onChange={(event) => onStatusChange(payment.id, event.target.value)}>
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
  );
}

export function UsersTable({ onActiveChange, onRoleChange, users }) {
  return (
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
                  <select value={user.role} onChange={(event) => onRoleChange(user.id, event.target.value)}>
                    {USER_ROLES.map((nextRole) => (
                      <option key={nextRole} value={nextRole}>{nextRole}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select value={user.is_active ? 'true' : 'false'} onChange={(event) => onActiveChange(user.id, event.target.value === 'true')}>
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
  );
}
