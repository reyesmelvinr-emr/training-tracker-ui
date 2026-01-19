import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main application layout with navigation sidebar
 */
export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.logo}>Training Tracker</h2>
          {user && (
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.email}</div>
              <div className={styles.userRole}>{user.role}</div>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            <span className={styles.icon}>📊</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/courses"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            <span className={styles.icon}>📚</span>
            Courses
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            <span className={styles.icon}>👥</span>
            Users
          </NavLink>

          <NavLink
            to="/enrollments"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            <span className={styles.icon}>📝</span>
            Enrollments
          </NavLink>

          {user?.role === 'Admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              <span className={styles.icon}>⚙️</span>
              Admin
            </NavLink>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <span className={styles.icon}>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.breadcrumb}>
            Training Tracker POC
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
