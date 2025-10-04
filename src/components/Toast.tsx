"use client";

import React, { useEffect } from "react";
import styles from "./Toast.module.scss";

interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  isOpen,
  message,
  type = "success",
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "✅";
    }
  };

  return (
    <div className={styles.toastContainer}>
      <div className={`${styles.toast} ${styles[type]}`}>
        <div className={styles.toastContent}>
          <span className={styles.icon}>{getIcon()}</span>
          <span className={styles.message}>{message}</span>
        </div>
        <button onClick={onClose} className={styles.closeButton}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
