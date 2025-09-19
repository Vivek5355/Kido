import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/common/Layout';
import { CircularProgress, Box } from '@mui/material';
import { ParentDashboard } from './pages/ParentDashboard';
import { ChildDashboard } from './pages/ChildDashboard';

function App() {
  const { loading, isAuthenticated, isParent } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  const ParentShell = () => (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      pendingApprovals={pendingApprovals} 
      isParent={true}
    >
      <ParentDashboard 
        key={activeTab}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setPendingApprovals={setPendingApprovals} 
      />
    </Layout>
  );

  const ChildShell = () => (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      pendingApprovals={pendingApprovals} 
      isParent={false}
    >
      <ChildDashboard
        key={activeTab}
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />
    </Layout>
  );
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Routes>
      <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? (
            <Navigate to={isParent ? "/dashboard/parent" : "/dashboard/child"} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route 
        path="/dashboard/parent/*" 
        element={
          isAuthenticated && isParent ? (
            <ParentShell />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route 
        path="/dashboard/child/*" 
        element={
          isAuthenticated && !isParent ? (
            <ChildShell />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;

