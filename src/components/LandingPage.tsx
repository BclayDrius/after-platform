"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useOptimizedNavigation } from "@/hooks/useOptimizedNavigation";
import styles from "./LandingPage.module.scss";

const LandingPage = () => {
  const { navigateTo } = useOptimizedNavigation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: "🎯",
      title: "Aprendizaje Personalizado",
      description:
        "Rutas de aprendizaje adaptadas a tu nivel y objetivos profesionales",
    },
    {
      icon: "🏆",
      title: "Sistema de Ranking",
      description: "Compite con otros estudiantes y sube en el ranking global",
    },
    {
      icon: "📊",
      title: "Seguimiento Detallado",
      description: "Monitorea tu progreso con métricas avanzadas y reportes",
    },
    {
      icon: "👥",
      title: "Comunidad Activa",
      description: "Conecta con otros estudiantes y profesores expertos",
    },
    {
      icon: "🎓",
      title: "Certificaciones",
      description: "Obtén certificados reconocidos al completar tus cursos",
    },
    {
      icon: "⚡",
      title: "Tecnología Avanzada",
      description: "Plataforma moderna con las últimas tecnologías educativas",
    },
  ];

  const stats = [
    { number: "10K+", label: "Estudiantes Activos" },
    { number: "500+", label: "Cursos Disponibles" },
    { number: "95%", label: "Tasa de Satisfacción" },
    { number: "24/7", label: "Soporte Disponible" },
  ];

  return (
    <div className={`${styles.landingPage} ${isVisible ? styles.visible : ""}`}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.gradientOrb1}></div>
          <div className={styles.gradientOrb2}></div>
          <div className={styles.gradientOrb3}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.logoSection}>
              <Image
                src="/af.png"
                alt="After Life Academy"
                width={80}
                height={80}
                className={styles.heroLogo}
              />
              <h1 className={styles.heroTitle}>
                After Life <span className={styles.accent}>Academy</span>
              </h1>
            </div>

            <p className={styles.heroSubtitle}>
              Transforma tu carrera profesional con nuestra plataforma de
              aprendizaje de última generación. Cursos especializados,
              seguimiento personalizado y una comunidad que te impulsa al éxito.
            </p>

            <div className={styles.heroActions}>
              <button
                className={styles.ctaPrimary}
                onClick={() => navigateTo("/contact")}
              >
                <span>Comenzar Gratis</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </button>

              <button
                className={styles.ctaSecondary}
                onClick={() => navigateTo("/login")}
              >
                Iniciar Sesión
              </button>
            </div>

            <div className={styles.trustIndicators}>
              <span className={styles.trustText}>
                Confiado por profesionales de:
              </span>
              <div className={styles.trustLogos}>
                <div className={styles.trustLogo}>MaxGrind</div>
                <div className={styles.trustLogo}>Macerados Inka</div>
                <div className={styles.trustLogo}>El Hada Artesana</div>
                <div className={styles.trustLogo}>XXXXX</div>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.heroImage}>
              <div className={styles.floatingCard1}>
                <div className={styles.cardIcon}>📚</div>
                <div className={styles.cardContent}>
                  <h4>JavaScript Avanzado</h4>
                  <p>Progreso: 78%</p>
                </div>
              </div>

              <div className={styles.floatingCard2}>
                <div className={styles.cardIcon}>🏆</div>
                <div className={styles.cardContent}>
                  <h4>Ranking #1</h4>
                  <p>1,250 puntos</p>
                </div>
              </div>

              <div className={styles.floatingCard3}>
                <div className={styles.cardIcon}>⚡</div>
                <div className={styles.cardContent}>
                  <h4>Racha de 15 días</h4>
                  <p>¡Sigue así!</p>
                </div>
              </div>

              <div className={styles.floatingMona}>
                <Image
                  src="/mona-af.png"
                  alt="Mona AF Mascot"
                  width={100}
                  height={100}
                  className={styles.monaImage}
                />
              </div>

              <div className={styles.mainDashboard}>
                <div className={styles.dashboardHeader}>
                  <h3>Anímate a aprender de una manera diferente</h3>
                  <div className={styles.dashboardStats}>
                    <div className={styles.stat}>
                      <span className={styles.statNumber}>XXXX</span>
                      <span className={styles.statLabel}>
                        XXXXXX
                      </span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statNumber}>XXX</span>
                      <span className={styles.statLabel}>
                        XXXXXXXXXXXXX
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statsContainer}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <h3 className={styles.statNumber}>{stat.number}</h3>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <div className={styles.featuresHeader}>
            <h2 className={styles.sectionTitle}>
              Todo lo que necesitas para{" "}
              <span className={styles.accent}>acelerar tu carrera</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Herramientas y recursos diseñados para maximizar tu potencial de
              aprendizaje
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              ¿Listo para transformar tu futuro profesional?
            </h2>
            <p className={styles.ctaSubtitle}>
              Únete a miles de profesionales que ya están avanzando en sus
              carreras
            </p>
            <div className={styles.ctaActions}>
              <button
                className={styles.ctaPrimary}
                onClick={() => navigateTo("/contact")}
              >
                Comenzar Ahora - Es Gratis
              </button>
              <p className={styles.ctaNote}>
                No se requiere tarjeta de crédito • Acceso inmediato
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <Image
                src="/af.png"
                alt="After Life Academy"
                width={40}
                height={40}
              />
              <span className={styles.footerBrandText}>After Life Academy</span>
            </div>

            <div className={styles.footerLinks}>
              <Link href="/about">Acerca de</Link>
              <Link href="/courses">Cursos</Link>
              <Link href="/contact">Contacto</Link>
              <Link href="/register">Registro</Link>
              <Link href="/privacy">Privacidad</Link>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>
              &copy; 2024 After Life Academy. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
