import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';

import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top page-shell">
        <section className="footer-column">
          <h4>Contacto Directo</h4>
          <p className="phone">
            <FaWhatsapp size={16} aria-hidden="true" />
            <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer">
              +56 9 1234 5678
            </a>
          </p>
          <p><a href="mailto:ventas@autoparts.cl">ventas@autoparts.cl</a></p>
          <div className="social-icons" aria-label="Redes sociales">
            <a href="https://www.facebook.com/" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <FaFacebookF size={16} aria-hidden="true" />
            </a>
            <a href="https://www.instagram.com/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <FaInstagram size={16} aria-hidden="true" />
            </a>
            <a href="https://twitter.com/" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
              <FaTwitter size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="footer-column">
          <h4>Marcas Trabajadas</h4>
          <ul className="brand-list">
            <li>Bosch</li>
            <li>ACDelco</li>
            <li>Mahle</li>
            <li>Mann</li>
            <li>NGK</li>
            <li>K&N</li>
          </ul>
        </section>

        <section className="footer-column">
          <h4>Navegacion</h4>
          <ul className="legal-list">
            <li><Link to="/catalog">Catalogo</Link></li>
            <li><Link to="/catalog/b2b">Canal B2B</Link></li>
            <li><Link to="/about">Nosotros</Link></li>
            <li><Link to="/contact">Contacto</Link></li>
          </ul>
        </section>
      </div>

      <div className="footer-bottom">
        <p>(c) 2026 AutoParts. Ecommerce automotriz para operaciones B2C/B2B.</p>
      </div>
    </footer>
  );
}

