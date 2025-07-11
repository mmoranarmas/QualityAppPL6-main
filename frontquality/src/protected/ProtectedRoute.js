import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();

  if (!user) {
    // Si no hay usuario autenticado, redirige a la página de inicio de sesión
    return <Navigate to="/" replace />;
  }

  // Si el usuario está autenticado, renderiza el componente hijo
  return children;
};

export default ProtectedRoute;