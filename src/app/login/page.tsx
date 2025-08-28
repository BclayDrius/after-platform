import Image from 'next/image';
import Link from 'next/link';
import styles from './login.module.scss';

export default function Login() {
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

        <form className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="tu@email.com"
              required 
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

          <button type="submit" className={styles.loginBtn}>
            Iniciar Sesión
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