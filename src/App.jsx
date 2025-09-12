import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ParentDashboard from './pages/ParentDashboard';
import Layout from './components/common/Layout';
import { CircularProgress, Box } from '@mui/material';
import ChildDashboard from './pages/ChildDashboard';

function App() {
  const { loading, isAuthenticated, isParent } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
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
            <Layout 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              pendingApprovals={pendingApprovals} 
              isParent={isParent}
            >
              {isParent ? (
                <ParentDashboard 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  setPendingApprovals={setPendingApprovals} 
                />
              ) : (
                <ChildDashboard 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab}
                />
              )}
            </Layout>
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

