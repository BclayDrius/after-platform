'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './login.module.scss';

const API_URL = "http://127.0.0.1:8000/api"; // tu backend

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/students/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
      } else {
        // Guardar tokens y datos del usuario
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userId', data.id);

        // Redirigir al dashboard
        window.location.href = '/'; 
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <Image 
            src="/af.png" 
            alt="After Life Academy" 
            width={60} 
            height={60}
            className={styles.logo}
          />
          <h1>After Life Academy</h1>
          <p>Inicia sesión en tu cuenta</p>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          {error && <p className={styles.errorMsg}>{error}</p>}

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="tu@email.com"
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="••••••••"
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.formOptions}>
            <label className={styles.checkbox}>
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <Link href="/forgot-password" className={styles.forgotLink}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>o</span>
        </div>

        <div className={styles.registerSection}>
          <p>¿No tienes una cuenta?</p>
          <Link href="/register" className={styles.registerLink}>
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
