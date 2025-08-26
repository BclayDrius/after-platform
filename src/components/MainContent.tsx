import React from 'react';
import styles from './MainContent.module.scss';

const MainContent = () => {
  return (
    <div className={styles.mainContent}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.menuToggle}>
            <span>‹</span>
          </button>
          <h1 className={styles.title}>Inicio</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              <span>👤</span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.greeting}>
          <h2>¡Hola, Student!</h2>
        </div>

        <div className={styles.courseCard}>
          <div className={styles.courseInfo}>
            <h3>Javascript</h3>
            <div className={styles.progressSection}>
              <div className={styles.progressCircle}>
                <div className={styles.progressValue}>52%</div>
                <div className={styles.progressLabel}>Cursado</div>
              </div>
              <div className={styles.courseDetails}>
                <div className={styles.courseStats}>
                  <div className={styles.stat}>
                    <span className={styles.statIcon}>📅</span>
                    <span>Cursando 100/100</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statIcon}>⏱️</span>
                    <span>Clases de 60 minutos</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statIcon}>📊</span>
                    <span>Dificultad: Principiante</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.courseActions}>
            <div className={styles.nextClass}>
              <div className={styles.nextClassInfo}>
                <span className={styles.nextClassLabel}>Estás al día con tu cursada</span>
                <span className={styles.nextClassDate}>Tu próxima clase será el 06/08/25</span>
              </div>
              <button className={styles.continueBtn}>Ir al Curso</button>
            </div>
          </div>
        </div>

        <div className={styles.learningPath}>
          <h3>Continúa tu aprendizaje</h3>
          <p>Tu ruta de aprendizaje se compone de una selección personalizada de Cursos que te ayudarán a alcanzar tus metas profesionales.</p>
          
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <p>No tienes ninguna ruta principal</p>
            <button className={styles.createPathBtn}>Busca una ruta para comenzar tu aprendizaje</button>
          </div>
        </div>

        <div className={styles.exploreSection}>
          <h3>Conoce más</h3>
        </div>
      </main>
    </div>
  );
};

export default MainContent;