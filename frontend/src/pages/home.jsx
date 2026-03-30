import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Truck } from 'lucide-react';

import '../styles/home.css';

const features = [
  {
    title: 'Calidad Verificada',
    copy: 'Stock con trazabilidad tecnica y control por SKU.',
    icon: Award,
  },
  {
    title: 'Despacho Agil',
    copy: 'Cobertura nacional con ventanas de entrega claras.',
    icon: Truck,
  },
  {
    title: 'Soporte Experto',
    copy: 'Asistencia en seleccion de piezas y compatibilidad.',
    icon: CheckCircle,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);

  const handleDistributorSubmit = (event) => {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  };

  return (
    <main className="home-page fade-in-up">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-overlay" aria-hidden="true" />
        <div className="page-shell home-hero-content">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="home-kicker"
          >
            Plataforma automotriz para compra profesional
          </motion.p>

          <motion.h1
            id="home-hero-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            Rendimiento Premium Para Cada Servicio
          </motion.h1>

          <motion.p
            className="home-lead"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
          >
            AutoParts conecta stock, compra y operacion comercial en una experiencia unica para clientes finales,
            distribuidores y equipo administrativo.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
          >
            <button type="button" className="btn-primary" onClick={() => navigate('/catalog')}>
              Explorar Catalogo
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/catalog/b2b')}>
              Ver Canal B2B
            </button>
          </motion.div>
        </div>
      </section>

      <section className="page-shell feature-strip" aria-label="Diferenciales principales">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.article
              className="feature-item"
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <Icon size={20} aria-hidden="true" />
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </motion.article>
          );
        })}
      </section>

      <section className="page-shell proof-grid" aria-label="Indicadores operativos">
        <div>
          <h2>Operacion Con Estilo Tecnico</h2>
          <p>
            Una interfaz clara acelera ventas, reduce errores de picking y mejora tiempos de respuesta en postventa.
          </p>
        </div>
        <ul>
          <li><strong>+80</strong> SKU activos listos para despacho.</li>
          <li><strong>B2C + B2B</strong> en una sola arquitectura operativa.</li>
          <li><strong>Webpay sandbox</strong> integrado para flujo de pago trazable.</li>
        </ul>
      </section>

      <section className="page-shell distributor-panel" aria-labelledby="dist-title">
        <div>
          <h2 id="dist-title">Acceso Para Distribuidores</h2>
          <p>
            Solicita habilitacion de cuenta mayorista y recibe condiciones comerciales con precios por canal.
          </p>
        </div>

        <form className="form-distributor" onSubmit={handleDistributorSubmit} noValidate>
          <label htmlFor="company">Empresa</label>
          <input id="company" name="company" autoComplete="organization" placeholder="Ej: Taller Ruta Sur" required />

          <label htmlFor="name">Nombre Responsable</label>
          <input id="name" name="name" autoComplete="name" placeholder="Nombre y apellido" required />

          <label htmlFor="email">Email Corporativo</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="compras@empresa.cl"
            spellCheck={false}
            required
          />

          <label htmlFor="phone">Telefono</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+56 9 1234 5678"
            required
          />

          <button type="submit" className="btn-primary">Solicitar Acceso</button>
          {sent && (
            <p className="form-feedback" aria-live="polite">
              Solicitud enviada. Te contactaremos dentro de 24 horas habiles.
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

