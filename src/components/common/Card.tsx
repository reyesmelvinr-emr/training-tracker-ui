import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, footer, children }) => (
  <section className={styles.card} aria-label={title || undefined}>
    {title && <header className={styles.header}>{title}</header>}
    <div>{children}</div>
    {footer && <footer className={styles.footer}>{footer}</footer>}
  </section>
);