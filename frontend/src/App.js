import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<ProtectedRoute requiredPermission="lead.view" />}>
            <Route index element={<Leads />} />
          </Route>
          <Route path="/users" element={<ProtectedRoute requiredPermission="user.view" />}>
            <Route index element={<Users />} />
          </Route>
          <Route path="/roles" element={<ProtectedRoute requiredPermission="role.view" />}>
            <Route index element={<Roles />} />
          </Route>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
