import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/context/auth";
import Loading from "~/loading";

export default function PrivateLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
