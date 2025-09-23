"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { authService, authStorage } from "@/services/authService";
import { supabase } from "@/lib/supabase";
import GuestGuard from "@/components/GuestGuard";
import styles from "./login.module.scss";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar si viene de registro exitoso
    if (searchParams.get("registered") === "true") {
      setSuccessMessage(
        "¡Cuenta creada exitosamente! Ahora puedes iniciar sesión."
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Primero hacer logout de cualquier sesión existente
      await supabase.auth.signOut();

      // Luego hacer login con las nuevas credenciales
      await authService.login(email, password);

      // Supabase maneja la sesión automáticamente
      // Redirigir al dashboard o a la página solicitada
      const redirectUrl = searchParams.get("redirect") || "/dashboard";
      window.location.href = redirectUrl;
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Error al iniciar sesión");
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
          {successMessage && (
            <p className={styles.successMsg}>{successMessage}</p>
          )}

          {/* Development helper */}

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
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className={styles.demoCredentials}>
          <h4>Credenciales de Prueba:</h4>
          <div className={styles.credentialsList}>
            <div className={styles.credentialItem}>
              <strong>Estudiante:</strong> student@test.com
            </div>
            <div className={styles.credentialItem}>
              <strong>Profesor:</strong> teacher@test.com
            </div>
            <div className={styles.credentialItem}>
              <strong>Admin:</strong> admin@test.com
            </div>
            <div className={styles.credentialItem}>
              <strong>Contraseña:</strong> password123
            </div>
          </div>
        </div>

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

export default function Login() {
  return (
    <GuestGuard>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </GuestGuard>
  );
}
