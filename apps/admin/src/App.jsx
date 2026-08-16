import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import Deposits from './pages/Deposits';
import Withdrawals from './pages/Withdrawals';
import Investments from './pages/Investments';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Referrals from './pages/Referrals';
import AuditLogs from './pages/AuditLogs';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

export default function App() {
  const token = useAuthStore((s) => s.token);
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/new" element={<ProjectForm />} />
        <Route path="/projects/:id/edit" element={<ProjectForm />} />
        <Route path="/deposits" element={<Deposits />} />
        <Route path="/withdrawals" element={<Withdrawals />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
