import React from 'react';
import styles from './PageLayout.module.scss';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PageLayout = ({ title, children }: PageLayoutProps) => {
  return (
    <div className={styles.pageLayout}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.menuToggle}>
            <span>‹</span>
          </button>
          <h1 className={styles.title}>{title}</h1>
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
        {children}
      </main>
    </div>
  );
};

export default PageLayout;