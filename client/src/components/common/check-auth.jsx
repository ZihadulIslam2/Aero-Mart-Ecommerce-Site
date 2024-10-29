import { Navigate, useLocation } from "react-router-dom";

const routes = {
  login: "/auth/login",
  register: "/auth/register",
  adminDashboard: "/admin/dashboard",
  shopHome: "/shop/home",
  shopCheckout: "/shop/checkout",
  unauthPage: "/unauth-page",
};

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  console.log(location.pathname, isAuthenticated);

  // Redirect from root path to /shop/home
  if (location.pathname === "/") {
    return <Navigate to={routes.shopHome} />;
  }

  // Allow access to /shop/home for all users
  if (location.pathname === routes.shopHome) {
    return <>{children}</>; // Render children for /shop/home
  }

  // Redirect unauthenticated users from /shop/checkout
  if (location.pathname === routes.shopCheckout && !isAuthenticated) {
    return <Navigate to={routes.login} />;
  }

  // Redirect unauthenticated users
  if (
    !isAuthenticated &&
    !location.pathname.includes("/login") &&
    !location.pathname.includes("/register")
  ) {
    return <Navigate to={routes.login} />;
  }

  // Redirect authenticated users trying to access login/register
  if (
    isAuthenticated &&
    (location.pathname.includes("/login") ||
      location.pathname.includes("/register"))
  ) {
    return user?.role === "admin" ? (
      <Navigate to={routes.adminDashboard} />
    ) : (
      <Navigate to={routes.shopHome} />
    );
  }

  // Redirect non-admin users from admin routes
  if (
    isAuthenticated &&
    user?.role !== "admin" &&
    location.pathname.includes("admin")
  ) {
    return <Navigate to={routes.unauthPage} />;
  }

  // Redirect admin users from shop routes
  if (
    isAuthenticated &&
    user?.role === "admin" &&
    location.pathname.includes("shop")
  ) {
    return <Navigate to={routes.adminDashboard} />;
  }

  // If no redirection is needed, render children
  return <>{children}</>;
}

export default CheckAuth;
