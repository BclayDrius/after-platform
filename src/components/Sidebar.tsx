"use client";
import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.scss";

const SidebarContent = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: "Inicio", icon: "📋", href: "/dashboard", badge: "NUEVO" },
    { name: "Cursos", icon: "📖", href: "/courses" },
    { name: "Clasificación", icon: "🏆", href: "/ranking" },
    { name: "Notas", icon: "📊", href: "/grades" },
  ];

  const sidebarItems = [
    { name: "Perfil", icon: "👤", href: "/profile" },
    { name: "Herramientas", icon: "🔧", href: "/tools" },
    {
      name: "Discord",
      icon: "🎮",
      href: "https://discord.gg/b8xxX6sy",
      target: "_blank",
    },
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
          <Link
            key={index}
            href={item.href}
            className={`${styles.navItem} ${
              pathname === item.href ? styles.active : ""
            }`}
            prefetch={true}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.text}>{item.name}</span>
            {item.badge && <span className={styles.badge}>{item.badge}</span>}
          </Link>
        ))}
      </nav>

      <div className={styles.divider}></div>

      <nav className={styles.nav}>
        {sidebarItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`${styles.navItem} ${
              pathname === item.href ? styles.active : ""
            }`}
            prefetch={true}
          >
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

const Sidebar = () => {
  return (
    <Suspense fallback={<div className={styles.sidebar}>Loading...</div>}>
      <SidebarContent />
    </Suspense>
  );
};
export default Sidebar;
