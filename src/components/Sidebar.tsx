import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Sidebar.module.scss';

const Sidebar = () => {
  const menuItems = [
    { name: 'Inicio', icon: '🏠', active: true },
    { name: 'Chat', icon: '💬' },
    { name: 'Mi ruta', icon: '🛤️' },
    { name: 'Mis cursos', icon: '📚', badge: 'NUEVO' },
    { name: 'Discord', icon: '🎮' },
    { name: 'Notificaciones', icon: '🔔' },
  ];

  const sidebarItems = [
    { name: 'Profile', icon: '👤', href: '/profile' },
    { name: 'Grades', icon: '📊', href: '/grades' },
    { name: 'Courses', icon: '📖', href: '/courses' },
    { name: 'Tools', icon: '🔧', href: '/tools' },
    { name: 'Ranking', icon: '🏆', href: '/ranking' },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/af.png" 
            alt="After Life Academy" 
            width={40} 
            height={40}
            className={styles.logoImage}
          />
          <span className={styles.logoText}>AFTER LIFE ACADEMY</span>
        </Link>
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
          <Link key={index} href={item.href} className={styles.navItem}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.text}>{item.name}</span>
          </Link>
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