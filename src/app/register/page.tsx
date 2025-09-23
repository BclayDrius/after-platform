"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useOptimizedNavigation } from "@/hooks/useOptimizedNavigation";
import { authService } from "@/services/authService";
import GuestGuard from "@/components/GuestGuard";
import styles from "./register.module.scss";

function RegisterForm() {
  const { navigateTo } = useOptimizedNavigation();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialty: "",
    acceptTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const specialties = [
    "Desarrollo Web",
    "Desarrollo Mobile",
    "Data Science",
    "DevOps",
    "Diseño UX/UI",
    "Ciberseguridad",
    "Inteligencia Artificial",
    "Blockchain",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      setLoading(false);
      return;
    }

    try {
      await authService.register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        specialty: formData.specialty,
      });

      // Registro exitoso, redirigir al login
      navigateTo("/login?registered=true");
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

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
          <h1>Crear Cuenta</h1>
          <p>Únete a la comunidad de profesionales</p>
        </div>

        <form className={styles.registerForm} onSubmit={handleSubmit}>
          {error && <p className={styles.errorMsg}>{error}</p>}

          <div className={styles.nameGroup}>
            <div className={styles.inputGroup}>
              <label htmlFor="first_name">Nombre</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                placeholder="Tu nombre"
                required
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="last_name">Apellido</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                placeholder="Tu apellido"
                required
                value={formData.last_name}
                onChange={handleChange}
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
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="specialty">Especialidad</label>
            <select
              id="specialty"
              name="specialty"
              required
              value={formData.specialty}
              onChange={handleChange}
            >
              <option value="">Selecciona tu especialidad</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.passwordGroup}>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
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
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <span>
                Acepto los <Link href="/terms">términos y condiciones</Link> y
                la <Link href="/privacy">política de privacidad</Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className={styles.registerBtn}
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
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
export default function Register() {
  return (
    <GuestGuard>
      <RegisterForm />
    </GuestGuard>
  );
}
