import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../store/slices/authSlice';

const ProtectedRoute = ({ requiredPermission }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem('token')) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && user) {
    let hasPermission = false;
    for (const role of user.Roles || []) {
      for (const permission of role.Permissions || []) {
        if (permission.name === requiredPermission) {
          hasPermission = true;
          break;
        }
      }
      if (hasPermission) break;
    }

    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
