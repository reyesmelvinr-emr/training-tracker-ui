import React from 'react';
import styles from './StatusBadge.module.css';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info';

export interface StatusBadgeProps {
  tone: BadgeTone;
  children: React.ReactNode;
  ariaLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ tone, children, ariaLabel }) => {
  const className = [styles.badge, styles[tone]].join(' ');
  return (
    <span role="status" aria-label={ariaLabel || String(children)} className={className}>
      {children}
    </span>
  );
};