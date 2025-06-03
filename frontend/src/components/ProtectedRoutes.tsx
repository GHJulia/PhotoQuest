import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }: { children: JSX.Element, requireAdmin?: boolean }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" />; // or 403 page
  }

  return children;
};

export default ProtectedRoute;
