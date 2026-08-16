import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Accounts from './pages/Accounts';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

export default function App() {
  const token = useAuthStore((s) => s.token);
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transactions/:id" element={<TransactionDetail />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
