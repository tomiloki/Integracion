// frontend/src/pages/cart.jsx

import { useState, useEffect } from 'react';
import {
  getCart,
  updateCartItem,
  removeCartItem,
} from '../services/cartService';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Al montar: obtener el carrito
  useEffect(() => {
    async function fetchCart() {
      try {
        setLoading(true);
        const data = await getCart();
        setCartItems(data);
      } catch (err) {
        setError('No se pudo cargar el carrito.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, []);

  // 2. Calcular total general
  const getTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0
    );
  };

  // 3. Al cambiar cantidad de un ítem
  const handleQuantityChange = async (cartItemId, newQty) => {
    if (newQty < 1) return; // No permitimos < 1
    try {
      const updated = await updateCartItem(cartItemId, newQty);
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === cartItemId
            ? {
                ...i,
                quantity: updated.quantity,
                subtotal: updated.subtotal,
              }
            : i
        )
      );
    } catch (err) {
      alert('No se pudo actualizar la cantidad.');
      console.error(err);
    }
  };

  // 4. Al eliminar un ítem
  const handleRemove = async (cartItemId) => {
    if (!window.confirm('¿Eliminar este producto del carrito?')) return;
    try {
      await removeCartItem(cartItemId);
      setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
    } catch (err) {
      alert('No se pudo eliminar el ítem del carrito.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex-center" style={{ padding: '4rem' }}>
        <div className="btn btn-primary">Cargando carrito...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex-center" style={{ padding: '4rem', color: 'red' }}>
        {error}
      </div>
    );
  }

  // 5. Si no hay ítems
  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <h2>Tu carrito está vacío</h2>
        <p className="m-around">Agrega productos al carrito desde el catálogo.</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Carrito de Compras</h2>

      <div className="overflow-x-auto">
        <table className="cart-list">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio Unitario</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>{item.product.name}</span>
                  </div>
                </td>
                <td>
                  ${Number(item.product.price).toFixed(2)}
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    style={{ width: '3rem', textAlign: 'center' }}
                    onChange={(e) =>
                      handleQuantityChange(item.id, parseInt(e.target.value, 10) || 1)
                    }
                  />
                </td>
                <td>
                  ${Number(item.subtotal).toFixed(2)}
                </td>
                <td>
                  <button
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--color-accent)',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleRemove(item.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cart-summary">
        <span>Total:</span>
        <span style={{ color: 'var(--color-primary-dark)', fontSize: '1.25rem' }}>
          ${getTotal().toFixed(2)}
        </span>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'right' }}>
        <button
          className="btn btn-primary"
          onClick={() => alert('Aquí iría el flujo de pago (Checkout)')}
        >
          Proceder a Checkout
        </button>
      </div>
    </div>
  );
}
