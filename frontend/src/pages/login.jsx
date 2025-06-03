import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import '../styles/login.css';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Mensaje de éxito proveniente de register
  const successMessage = location.state?.message || null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await loginUser(form);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Error desconocido.');
    }
  };

  return (
    <div className="form-container card">
      <h2 className="form-title">Iniciar Sesión</h2>

      {/* Si venimos de registro exitoso */}
      {successMessage && <p className="success">{successMessage}</p>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Usuario */}
        <div className="form-field">
          <label>Usuario</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="tu_usuario"
            required
          />
        </div>

        {/* Contraseña */}
        <div className="form-field password-field">
          <label>Contraseña</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="tu_contraseña"
              required
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <button className="form-submit" type="submit">
          Ingresar
        </button>
      </form>

      <p className="alternative">
        ¿No tienes una cuenta?{' '}
        <Link to="/register" className="link">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
