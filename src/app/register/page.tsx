import Image from 'next/image';
import Link from 'next/link';
import styles from './register.module.scss';

export default function Register() {
  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.logoSection}>
          <Image 
            src="/af.png" 
            alt="After Life Academy" 
            width={60} 
            height={60}
            className={styles.logo}
          />
          <h1>After Life Academy</h1>
          <p>Crea tu cuenta y comienza a aprender</p>
        </div>

        <form className={styles.registerForm}>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="firstName">Nombre</label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName" 
                placeholder="Tu nombre"
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="lastName">Apellido</label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName" 
                placeholder="Tu apellido"
                required 
              />
            </div>
          </div>

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

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              placeholder="••••••••"
              required 
            />
          </div>

          <div className={styles.termsSection}>
            <label className={styles.checkbox}>
              <input type="checkbox" required />
              <span>
                Acepto los{' '}
                <Link href="/terms" className={styles.link}>
                  Términos y Condiciones
                </Link>
                {' '}y la{' '}
                <Link href="/privacy" className={styles.link}>
                  Política de Privacidad
                </Link>
              </span>
            </label>
          </div>

          <button type="submit" className={styles.registerBtn}>
            Crear Cuenta
          </button>
        </form>

        <div className={styles.divider}>
          <span>o</span>
        </div>

        <div className={styles.loginSection}>
          <p>¿Ya tienes una cuenta?</p>
          <Link href="/login" className={styles.loginLink}>
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}