import React from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/about.css';

export default function Nosotros() {
  const navigate = useNavigate();

  return (
    <main className="about-page fade-in-up">
      <section className="about-hero">
        <div className="page-shell about-hero-inner">
          <p className="about-kicker">AutoParts</p>
          <h1>Ingenieria automotriz para compras confiables.</h1>
          <p className="about-lead">
            Conectamos clientes finales y distribuidores con un inventario real,
            procesos claros y tiempos de respuesta rapidos para mantener cada
            vehiculo en movimiento.
          </p>
          <div className="about-hero-actions">
            <button type="button" className="btn-primary" onClick={() => navigate('/contact')}>
              Hablar con nosotros
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/catalog')}>
              Ver catalogo
            </button>
          </div>
        </div>
      </section>

      <section className="page-shell about-overview">
        <article className="about-copy">
          <h2>Quienes somos</h2>
          <p>
            Somos un equipo enfocado en repuestos y accesorios para el mercado
            automotriz chileno. Priorizamos stock util, trazabilidad de pedidos
            y una experiencia de compra que no haga perder tiempo.
          </p>
          <p>
            Nuestro compromiso es simple: informacion precisa del producto,
            soporte oportuno y una operacion digital robusta para B2C y B2B.
          </p>
        </article>

        <aside className="about-facts" aria-label="Indicadores de AutoParts">
          <div>
            <p className="fact-value">+10</p>
            <p className="fact-label">anos de experiencia</p>
          </div>
          <div>
            <p className="fact-value">B2C + B2B</p>
            <p className="fact-label">canales operativos</p>
          </div>
          <div>
            <p className="fact-value">24/7</p>
            <p className="fact-label">plataforma disponible</p>
          </div>
        </aside>
      </section>

      <section className="page-shell about-pillars">
        <article className="pillar">
          <h3>Mision</h3>
          <p>
            Entregar repuestos confiables con un flujo de compra transparente,
            rapido y con control de stock en tiempo real.
          </p>
        </article>
        <article className="pillar">
          <h3>Vision</h3>
          <p>
            Ser referencia en comercio automotriz digital en Chile, combinando
            excelencia operativa con una experiencia premium.
          </p>
        </article>
        <article className="pillar">
          <h3>Valores</h3>
          <ul>
            <li>Calidad tecnica</li>
            <li>Transparencia comercial</li>
            <li>Innovacion continua</li>
            <li>Servicio al cliente</li>
          </ul>
        </article>
      </section>

      <section className="page-shell about-cta">
        <h2>Necesitas apoyo para una compra especifica?</h2>
        <p>
          Nuestro equipo te orienta en compatibilidad, precios y tiempos para
          que compres con seguridad.
        </p>
        <button type="button" className="btn-primary" onClick={() => navigate('/contact')}>
          Ir a contacto
        </button>
      </section>
    </main>
  );
}
