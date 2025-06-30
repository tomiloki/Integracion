// frontend/src/pages/Contact.jsx

import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import '../styles/contact.css';

export default function Contact() {
  return (
    <main className="contact-page">
      {/* Hero */}
      <section className="contact-hero">
        <h1>Contacto</h1>
      </section>

      {/* Información de la empresa */}
      <section className="contact-info container">
        <div className="info-card">
          <Phone size={32} className="info-icon" />
          <h3>Teléfono</h3>
          <p>+56 9 1234 5678</p>
        </div>
        <div className="info-card">
          <Mail size={32} className="info-icon" />
          <h3>Email</h3>
          <p>soporte@autoparts.cl</p>
        </div>
        <div className="info-card">
          <MapPin size={32} className="info-icon" />
          <h3>Dirección</h3>
          <p>Av. Automotriz 1234, Santiago, Chile</p>
        </div>
        <div className="info-card">
          <Clock size={32} className="info-icon" />
          <h3>Horario</h3>
          <p>Lun–Vie: 9:00–18:00<br />Sáb: 10:00–14:00</p>
        </div>
      </section>
    </main>
);
}