import React from 'react';

import {
  AdminHero,
  CategoryManager,
  MetricsGrid,
  OrdersTable,
  PaymentsTable,
  ProductForm,
  ProductTable,
  UsersTable,
} from './admin/AdminDashboardSections';
import { useAdminDashboard } from './admin/useAdminDashboard';
import '../styles/adminDashboard.css';

export default function AdminDashboard() {
  const {
    categories,
    categoryName,
    editingProductId,
    error,
    handlers,
    loading,
    opMessage,
    orders,
    payments,
    productForm,
    products,
    summaryCards,
    users,
  } = useAdminDashboard();

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
        <button type="button" className="btn-secondary" onClick={handlers.loadData}>Reintentar</button>
      </div>
    );
  }

  return (
    <main className="page-shell admin-page fade-in-up">
      <AdminHero opMessage={opMessage} />
      <MetricsGrid cards={summaryCards} />

      <section className="admin-grid two-columns">
        <CategoryManager
          categories={categories}
          categoryName={categoryName}
          onCategoryNameChange={handlers.setCategoryName}
          onCreateCategory={handlers.handleCreateCategory}
          onDeleteCategory={handlers.handleDeleteCategory}
          products={products}
        />
        <ProductForm
          categories={categories}
          editingProductId={editingProductId}
          form={productForm}
          onCancel={handlers.resetProductForm}
          onChange={handlers.setProductForm}
          onSubmit={handlers.handleCreateOrUpdateProduct}
        />
      </section>

      <ProductTable
        onDeleteProduct={handlers.handleDeleteProduct}
        onEditProduct={handlers.startEditProduct}
        products={products}
      />
      <OrdersTable onStatusChange={handlers.handleOrderStatus} orders={orders} />
      <PaymentsTable onStatusChange={handlers.handlePaymentStatus} payments={payments} />
      <UsersTable
        onActiveChange={handlers.handleUserActive}
        onRoleChange={handlers.handleUserRole}
        users={users}
      />
    </main>
  );
}
