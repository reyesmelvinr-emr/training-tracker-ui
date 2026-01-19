import React from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  disabled,
  ...rest
}) => {
  const classes = [styles.btn, styles[variant], className].filter(Boolean).join(' ');
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={styles.loadingSpinner} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
};