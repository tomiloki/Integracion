import React from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

import '../styles/contact.css';

const CONTACT_BLOCKS = [
  {
    icon: Phone,
    title: 'Telefono',
    detail: '+56 9 1234 5678',
    helper: 'Soporte comercial y postventa',
  },
  {
    icon: Mail,
    title: 'Email',
    detail: 'soporte@autoparts.cl',
    helper: 'Respuesta en horario habil',
  },
  {
    icon: MapPin,
    title: 'Direccion',
    detail: 'Av. Automotriz 1234, Santiago, Chile',
    helper: 'Atencion presencial con agenda',
  },
  {
    icon: Clock,
    title: 'Horario',
    detail: 'Lun-Vie: 9:00-18:00 | Sab: 10:00-14:00',
    helper: 'Domingos y festivos cerrado',
  },
];

export default function Contact() {
  return (
    <main className="contact-page fade-in-up">
      <section className="contact-hero">
        <div className="page-shell contact-hero-inner">
          <p className="contact-kicker">Contacto</p>
          <h1>Hablemos de tu proximo pedido</h1>
          <p>
            Si necesitas compatibilidad, cotizacion mayorista o seguimiento de
            una orden, nuestro equipo esta listo para ayudarte.
          </p>
        </div>
      </section>

      <section className="page-shell contact-layout">
        <article className="contact-panel">
          <h2>Canales disponibles</h2>
          <p>
            Te recomendamos escribir por email para cotizaciones complejas y
            usar telefono para dudas urgentes de stock o despacho.
          </p>
          <ul>
            <li>Atencion para clientes B2C y distribuidores B2B.</li>
            <li>Confirmacion de disponibilidad en tiempo real.</li>
            <li>Apoyo tecnico para seleccion de repuestos.</li>
          </ul>
        </article>

        <div className="contact-info-grid">
          {CONTACT_BLOCKS.map(({ icon: Icon, title, detail, helper }) => (
            <article key={title} className="info-card">
              <Icon size={20} className="info-icon" aria-hidden="true" />
              <h3>{title}</h3>
              <p className="info-detail">{detail}</p>
              <p className="info-helper">{helper}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
