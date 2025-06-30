// frontend/src/pages/Home.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Truck, CheckCircle } from 'lucide-react';
import '../styles/home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="container">
          <h1>Bienvenido a AutoParts</h1>
          <p>Las mejores piezas y accesorios automotrices al alcance de un clic.</p>
          <button
            className="btn-hero"
            onClick={() => navigate('/catalog')}
          >
            Descubre nuestro catálogo
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features container">
        <div className="feature-card">
          <Award size={48} className="feature-icon" />
          <h3>Calidad Garantizada</h3>
          <p>Solo trabajamos con marcas reconocidas para asegurar tu confianza.</p>
        </div>
        <div className="feature-card">
          <Truck size={48} className="feature-icon" />
          <h3>Envío Rápido</h3>
          <p>Despacho ágil a todo Chile en 24-48 horas.</p>
        </div>
        <div className="feature-card">
          <CheckCircle size={48} className="feature-icon" />
          <h3>Atención al Cliente</h3>
          <p>Un equipo especializado siempre dispuesto a ayudarte.</p>
        </div>
      </section>

      {/* Wholesale Inquiry Form */}
      <section className="home-form container">
        <h2>¿Eres Distribuidor?</h2>
        <p>Solicita acceso a nuestro catálogo mayorista y recibe condiciones especiales.</p>
        <form className="form-distributor">
          <div className="form-group">
            <label htmlFor="company">Empresa</label>
            <input type="text" id="company" name="company" placeholder="Nombre de tu empresa" required />
          </div>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input type="text" id="name" name="name" placeholder="Tu nombre completo" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Tu correo electrónico" required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input type="tel" id="phone" name="phone" placeholder="+56 9 1234 5678" required />
          </div>
          <button type="submit" className="btn-distributor">Solicitar Acceso</button>
        </form>
      </section>
    </main>
  );
}