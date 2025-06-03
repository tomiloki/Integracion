import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/register.css';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateBeforeSubmit = () => {
    const newErrors = {};

    // Username no vacío
    if (!form.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio.';
    }

    // Email con formato
    if (!form.email.trim()) {
      newErrors.email = 'El correo es obligatorio.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = 'Ingresa un correo válido.';
      }
    }

    // Contraseña robusta: mínimo 8, letra, número y caracter especial
    if (!form.password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else {
      const pwd = form.password;
      const strongRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!strongRegex.test(pwd)) {
        newErrors.password =
          'Debe tener mínimo 8 caracteres, una letra, un número y un símbolo (!@#$…).';
      }
    }

    // Confirmar contraseña
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña.';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    // Rol (siempre será válido porque viene de select)
    if (!['customer', 'distributor', 'admin'].includes(form.role)) {
      newErrors.role = 'Selecciona un rol válido.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const clientErrors = validateBeforeSubmit();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const result = await registerUser({
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
      setErrors(result.errors || { general: 'Error desconocido.' });
    }
  };

  return (
    <div className="form-container card">
      <h2 className="form-title">Crear Cuenta</h2>
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
          />
          {errors.username && <p className="error">{errors.username}</p>}
        </div>

        {/* Email */}
        <div className="form-field">
          <label>Correo Electrónico</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="ejemplo@dominio.com"
          />
          {errors.email && <p className="error">{errors.email}</p>}
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
              placeholder="Mín. 8 caracteres, letra, número y símbolo"
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
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        {/* Confirmar Contraseña */}
        <div className="form-field password-field">
          <label>Confirmar Contraseña</label>
          <div className="password-wrapper">
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Rol */}
        <div className="form-field">
          <label>Rol</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="customer">Cliente Final</option>
            <option value="distributor">Distribuidor</option>
            <option value="admin">Administrador</option>
          </select>
          {errors.role && <p className="error">{errors.role}</p>}
        </div>

        {/* Error general */}
        {errors.general && <p className="error general">{errors.general}</p>}

        <button className="form-submit" type="submit">
          Registrar
        </button>
      </form>
      <p className="small-text">
        ¿Ya tienes una cuenta?{' '}
        <span className="link" onClick={() => navigate('/login')}>
          Inicia Sesión
        </span>
      </p>
    </div>
  );
}
