import { useEffect, useMemo, useState } from 'react';

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
} from '../../services/adminService';

export const ORDER_STATUSES = ['pendiente', 'pago_en_proceso', 'completado', 'rechazado', 'cancelado'];
export const PAYMENT_STATUSES = ['pendiente', 'iniciada', 'pagado', 'rechazado'];
export const USER_ROLES = ['customer', 'distributor', 'admin'];

export const INITIAL_PRODUCT_FORM = {
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

function categoryIdFor(product) {
  return product.category?.id ?? product.category ?? '';
}

export function useAdminDashboard() {
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
    const hasProducts = products.some((product) => categoryIdFor(product) === category.id);
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
      category_id: String(categoryIdFor(product)),
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

  return {
    categories,
    categoryName,
    editingProductId,
    error,
    handlers: {
      handleCreateCategory,
      handleCreateOrUpdateProduct,
      handleDeleteCategory,
      handleDeleteProduct,
      handleOrderStatus,
      handlePaymentStatus,
      handleUserActive,
      handleUserRole,
      loadData,
      resetProductForm,
      setCategoryName,
      setProductForm,
      startEditProduct,
    },
    loading,
    opMessage,
    orders,
    payments,
    productForm,
    products,
    summaryCards,
    users,
  };
}
