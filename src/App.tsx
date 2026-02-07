import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePortfolio from './pages/CreatePortfolio';
import Dashboard from './pages/Dashboard';
import Portfolios from './pages/Portfolios';
import PortfolioDetail from './pages/PortfolioDetail';
import Profile from './pages/Profile';
import Research from './pages/Research';
import Analysis from './pages/Analysis';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
      <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      
      <Route path="/" element={user ? <Layout /> : <Landing />}>
        <Route index element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="create-portfolio" element={<CreatePortfolio />} />
        <Route path="portfolios" element={<Portfolios />} />
        <Route path="portfolios/:id" element={<PortfolioDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="research" element={<Research />} />
        <Route path="analysis/:symbol" element={<Analysis />} />
      </Route>
      
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
    </Routes>
  );
}

export default App;
