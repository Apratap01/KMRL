import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useSelector((state) => state.auth);

  // while fetching user from /api/me
  if (loading) {
    return <h2 className="text-center mt-10">Loading...</h2>;
  }

  // if not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // if logged in → render the protected component
  return children;
}
