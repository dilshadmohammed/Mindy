// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../axios/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsAllowed(false);
        setIsLoading(false);
        return;
      }

    try {
      const res = await api.get('/users/verify-access-token', {
        headers: {
        Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.email) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      setIsAllowed(false);
    } finally {
      setIsLoading(false);
    }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // or a spinner
  }

  return isAllowed ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
