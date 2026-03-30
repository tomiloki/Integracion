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

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await login(form);
      if (response.success) {
        navigate('/catalog');
      } else {
        setError(response.error || 'Usuario o contrasena incorrectos');
      }
    } catch {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h2>Iniciar Sesion</h2>

        {successMessage && <div className="alert success">{successMessage}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate data-testid="login-form">
          <div className="form-field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              data-testid="login-username"
              value={form.username}
              onChange={handleChange}
              placeholder="tu_usuario"
              disabled={loading}
              required
            />
          </div>

          <div className="form-field password-field">
            <label htmlFor="password">Contrasena</label>
            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                data-testid="login-password"
                value={form.password}
                onChange={handleChange}
                placeholder="tu_contrasena"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword((value) => !value)}
                disabled={loading}
                aria-label="Mostrar u ocultar contrasena"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button className="form-submit" type="submit" disabled={loading} data-testid="login-submit">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="alternative">
          No tienes cuenta? <Link to="/register" className="link">Registrate aqui</Link>
        </p>
      </div>
    </main>
  );
}

