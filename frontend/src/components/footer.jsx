// src/components/Footer.jsx
import React from 'react';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';
import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        {/* Columna 1: Contacto */}
        <div className="footer-column">
          <h4>Contáctanos</h4>
          <p className="phone">
            <FaWhatsapp size={18} />{' '}
            <a
              href="https://wa.me/56912345678"
              target="_blank"
              rel="noopener noreferrer"
            >
              +56 9 1234 5678
            </a>
          </p>
          <div className="social-icons">
            <a href="#" aria-label="Facebook">
              <FaFacebookF size={18} />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram size={18} />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter size={18} />
            </a>
          </div>
        </div>

        {/* Columna 2: Marcas */}
        <div className="footer-column">
          <h4>Marcas con las que trabajamos</h4>
          <ul className="brand-list">
            <li>Bosch</li>
            <li>Fram</li>
            <li>ACDelco</li>
            <li>Mann</li>
            <li>Mahle</li>
            <li>K&amp;N</li>
            <li>NGK</li>
          </ul>
        </div>

        {/* Columna 3: Enlaces legales */}
        <div className="footer-column">
          <h4>Enlaces</h4>
          <ul className="legal-list">
            <li><a href="/privacy">Política de privacidad</a></li>
            <li><a href="/terms">Términos y condiciones</a></li>
            <li><a href="/help">Ayuda</a></li>
            <li><a href="/contact">Contacto</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 AutoParts. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
