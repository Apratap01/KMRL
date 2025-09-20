import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.department && !user?.data?.department) {
    return (
      <Navigate
        to="/Complete-Profile"
        replace
        state={{ userId: user.id || user.data.id }}
      />
    );
  }

  return children;
}
