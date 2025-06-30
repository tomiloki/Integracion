import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/register.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setGeneralError('');
  };

  const validateBeforeSubmit = () => {
    const newErrors = {};
    const { username, email, password, confirmPassword, role } = form;

    if (!username.trim()) newErrors.username = 'El nombre de usuario es obligatorio.';
    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ingresa un correo válido.';
    }
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)) {
      newErrors.password = 'Debe tener mínimo 8 caracteres, letra, número y símbolo.';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    if (!['customer', 'distributor'].includes(role)) {
      newErrors.role = 'Selecciona un rol válido.';
    }

    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const clientErrors = validateBeforeSubmit();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }
    setLoading(true);
    setGeneralError('');
    setErrors({});
    try {
      const result = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      if (result.success) {
        navigate('/login', {
          state: { message: 'Usuario creado exitosamente. Por favor inicia sesión.' },
        });
      } else {
        setErrors(result.errors || {});
        setGeneralError(result.error || 'Error al registrarse.');
      }
    } catch {
      setGeneralError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-card">
        <h2>Crear Cuenta</h2>
        {generalError && <div className="alert error">{generalError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="tu_usuario"
              disabled={loading}
              required
            />
            {errors.username && <div className="alert error">{errors.username}</div>}
          </div>

          <div className="form-field">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ejemplo@dominio.com"
              disabled={loading}
              required
            />
            {errors.email && <div className="alert error">{errors.email}</div>}
          </div>

          <div className="form-field password-field">
            <label htmlFor="password">Contraseña</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mín. 8 caracteres, letra, número y símbolo"
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
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <div className="alert error">{errors.password}</div>}
          </div>

          <div className="form-field password-field">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="password-wrapper">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowConfirm(v => !v)}
                disabled={loading}
                aria-label="Mostrar u ocultar contraseña"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <div className="alert error">{errors.confirmPassword}</div>}
          </div>

          <div className="form-field">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="customer">Cliente Final</option>
              <option value="distributor">Distribuidor</option>
            </select>
            {errors.role && <div className="alert error">{errors.role}</div>}
          </div>

          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? 'Registrando…' : 'Registrar'}
          </button>
        </form>

        <p className="alternative">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="link">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
