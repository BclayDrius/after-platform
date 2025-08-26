import React from 'react';
import styles from './Sidebar.module.scss';

const Sidebar = () => {
  const menuItems = [
    { name: 'Inicio', icon: '🏠', active: true },
    { name: 'Chat', icon: '💬' },
    { name: 'Mi ruta', icon: '🛤️' },
    { name: 'CoderJobs', icon: '💼' },
    { name: 'Mis cursos', icon: '📚', badge: 'NUEVO' },
    { name: 'Discord', icon: '🎮' },
    { name: 'Notificaciones', icon: '🔔' },
  ];

  const sidebarItems = [
    { name: 'Profile', icon: '👤' },
    { name: 'Grades', icon: '📊' },
    { name: 'Courses', icon: '📖' },
    { name: 'Tools', icon: '🔧' },
    { name: 'Ranking', icon: '🏆' },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoText}>AFTER LIFE ACADEMY</span>
        </div>
      </div>
      
      <nav className={styles.nav}>
        {menuItems.map((item, index) => (
          <div 
            key={index} 
            className={`${styles.navItem} ${item.active ? styles.active : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.text}>{item.name}</span>
            {item.badge && (
              <span className={styles.badge}>{item.badge}</span>
            )}
          </div>
        ))}
      </nav>

      <div className={styles.divider}></div>

      <nav className={styles.nav}>
        {sidebarItems.map((item, index) => (
          <div key={index} className={styles.navItem}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.text}>{item.name}</span>
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.referralSection}>
          <span className={styles.referralIcon}>🎁</span>
          <span className={styles.referralText}>¡Refiere y gana!</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;