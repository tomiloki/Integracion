// frontend/src/components/ProductCard.jsx

import React from 'react';
import '../styles/productCard.css';
import { addToCart } from '../services/cartService';

export default function ProductCard({ product }) {
  const handleAddToCart = async () => {
    try {
      // Llamamos al servicio que irá al endpoint POST /api/cart/
      await addToCart(product.id, 1);
      alert(`Se agregó "${product.name}" al carrito.`);
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      alert('No se pudo agregar el producto al carrito. Verifica que hayas iniciado sesión.');
    }
  };

  return (
    <div className="product-card">
      <div className="badge">{product.category.name}</div>
      <div className="image-container">
        <img src={product.image || '/placeholder.png'} alt={product.name} />
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-sku">SKU: {product.sku}</p>
      <p className="product-price">${product.price.toLocaleString()}</p>
      <button className="btn-add-cart" onClick={handleAddToCart}>
        Agregar al carrito
      </button>
    </div>
  );
}
