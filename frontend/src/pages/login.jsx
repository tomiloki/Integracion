// src/pages/login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message || '';
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(form);
      if (res.success) {
        // DEBUG: Verificar que se guardaron correctamente los tokens
        const accessKey = process.env.REACT_APP_TOKEN_KEY_ACCESS;    // ej. "access"
        const refreshKey = process.env.REACT_APP_TOKEN_KEY_REFRESH;  // ej. "refresh"
        console.log('▶️ Access token guardado:', localStorage.getItem(accessKey));
        console.log('▶️ Refresh token guardado:', localStorage.getItem(refreshKey));

        navigate('/catalog');
      } else {
        setError(res.error || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>

        {successMessage && <div className="alert success">{successMessage}</div>}
        {error          && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="tu_usuario"
              disabled={loading}
              required
            />
          </div>

          <div className="form-field password-field">
            <label htmlFor="password">Contraseña</label>
            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="tu_contraseña"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword(v => !v)}
                disabled={loading}
                aria-label="Mostrar u ocultar contraseña"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="alternative">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="link">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  );
}
