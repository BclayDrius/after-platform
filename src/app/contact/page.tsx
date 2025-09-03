"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useOptimizedNavigation } from "@/hooks/useOptimizedNavigation";
import styles from "./contact.module.scss";

export default function Contact() {
  const { navigateTo } = useOptimizedNavigation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    interest: "",
    message: "",
    preferredContact: "email",
    acceptMarketing: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const interests = [
    "Desarrollo Web",
    "Desarrollo Mobile",
    "Data Science",
    "DevOps",
    "Diseño UX/UI",
    "Ciberseguridad",
    "Inteligencia Artificial",
    "Blockchain",
    "Gestión de Proyectos",
    "Marketing Digital",
    "Otro",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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

    try {
      // Simular envío del formulario (aquí integrarías con tu backend o servicio de email)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // En un caso real, harías algo como:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      console.log("Datos del formulario:", formData);
      setIsSubmitted(true);
    } catch (err) {
      setError("Error al enviar el formulario. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={styles.contactContainer}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✅</div>
          <h1>¡Gracias por tu interés!</h1>
          <p>
            Hemos recibido tu información y nos pondremos en contacto contigo en
            las próximas 24 horas para programar una demostración personalizada.
          </p>
          <div className={styles.successActions}>
            <button
              className={styles.primaryBtn}
              onClick={() => navigateTo("/")}
            >
              Volver al Inicio
            </button>
            <Link href="/login" className={styles.secondaryBtn}>
              ¿Ya tienes cuenta? Inicia Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contactContainer}>
      <div className={styles.contactCard}>
        <div className={styles.header}>
          <Link href="/" className={styles.backButton}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5m7 7-7-7 7-7" />
            </svg>
            Volver
          </Link>

          <div className={styles.logoSection}>
            <Image
              src="/af.png"
              alt="After Life Academy"
              width={60}
              height={60}
              className={styles.logo}
            />
            <div>
              <h1>Comienza tu transformación profesional</h1>
              <p>
                Déjanos tus datos y te contactaremos para una demostración
                personalizada
              </p>
            </div>
          </div>
        </div>

        <form className={styles.contactForm} onSubmit={handleSubmit}>
          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.formSection}>
            <h3>Información Personal</h3>

            <div className={styles.nameGroup}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName">Nombre *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Tu nombre"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="lastName">Apellido *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Tu apellido"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.contactGroup}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email *</label>
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
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Información Profesional</h3>

            <div className={styles.professionalGroup}>
              <div className={styles.inputGroup}>
                <label htmlFor="company">Empresa</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  placeholder="Nombre de tu empresa"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="position">Cargo</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  placeholder="Tu cargo actual"
                  value={formData.position}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="interest">Área de Interés *</label>
              <select
                id="interest"
                name="interest"
                required
                value={formData.interest}
                onChange={handleChange}
              >
                <option value="">Selecciona tu área de interés</option>
                {interests.map((interest) => (
                  <option key={interest} value={interest}>
                    {interest}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Cuéntanos más</h3>

            <div className={styles.inputGroup}>
              <label htmlFor="message">
                ¿Qué te gustaría lograr con After Life Academy?
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Describe tus objetivos profesionales y cómo podemos ayudarte..."
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="preferredContact">
                Método de contacto preferido
              </label>
              <select
                id="preferredContact"
                name="preferredContact"
                value={formData.preferredContact}
                onChange={handleChange}
              >
                <option value="email">Email</option>
                <option value="phone">Teléfono</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="acceptMarketing"
                checked={formData.acceptMarketing}
                onChange={handleChange}
              />
              <span>
                Acepto recibir información sobre cursos, promociones y novedades
                de After Life Academy
              </span>
            </label>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Enviando...
              </>
            ) : (
              "Solicitar Demostración Gratuita"
            )}
          </button>

          <p className={styles.privacyNote}>
            Al enviar este formulario, aceptas nuestra{" "}
            <Link href="/privacy">política de privacidad</Link>. Nos
            comprometemos a proteger tu información personal.
          </p>
        </form>
      </div>
    </div>
  );
}
