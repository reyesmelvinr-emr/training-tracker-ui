import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { CourseCatalog } from './CourseCatalog';
import { Users } from './Users';
import { Enrollments } from './Enrollments';
import { AdminPanel } from './AdminPanel';
import { NotFound } from './NotFound';
import { useAuth } from '../context/AuthContext';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/courses" element={<CourseCatalog />} />
      <Route path="/users" element={<Users />} />
      <Route path="/enrollments" element={<Enrollments />} />
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user || user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
