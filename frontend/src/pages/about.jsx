// frontend/src/pages/Nosotros.jsx

import React from 'react';
import '../styles/about.css';
import { useNavigate } from 'react-router-dom';

export default function Nosotros() {
  const navigate = useNavigate();
  
  return (
    <main className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <h1>Sobre Nosotros</h1>
      </section>

      {/* Company Overview */}
      <section className="about-content container">
        <p>
          En <strong>AutoParts</strong> nos apasiona ofrecerte las mejores piezas y
          accesorios para tu vehículo. Con más de 10 años de experiencia en el
          mercado automotriz, contamos con un catálogo amplio y de alta calidad,
          respaldado por marcas líderes a nivel mundial.
        </p>
        <p>
          Nuestro compromiso es brindarte un servicio ágil, seguro y confiable.
          Tanto si eres un cliente particular como un distribuidor mayorista,
          encontrarás lo que necesitas con precios competitivos y garantía.
        </p>
      </section>

      {/* Mission, Vision, Values */}
      <section className="about-cards container">
        <div className="card">
          <h3>Misión</h3>
          <p>
            Suministrar piezas de alta calidad para satisfacer las necesidades
            de nuestros clientes, con un enfoque en la innovación y la
            excelencia en el servicio.
          </p>
        </div>
        <div className="card">
          <h3>Visión</h3>
          <p>
            Ser reconocidos como el proveedor automotriz de confianza más
            destacado en la región, expandiendo nuestra oferta y presencia
            global.
          </p>
        </div>
        <div className="card">
          <h3>Valores</h3>
            <p>Calidad</p>
            <p>Transparencia</p>
            <p>Innovación</p>
            <p>Servicio al cliente</p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="about-cta container">
        <h2>¿Tienes preguntas?</h2>
        <p>
          Contáctanos y nuestro equipo estará encantado de ayudarte a encontrar
          las piezas que necesitas.
        </p>
        <button
            className="btn-hero"
            onClick={() => navigate('/contact')}
          >
            Contáctanos
          </button>
      </section>
    </main>
  );
}
