import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Restrict routes to specific user types
 * @param {string[]} allowedTypes - e.g., ['STUDENT'], ['STAFF'], ['STUDENT', 'STAFF']
 */
const RoleRoute = ({ children, allowedTypes = [] }) => {
  const { userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!allowedTypes.includes(userType)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;
