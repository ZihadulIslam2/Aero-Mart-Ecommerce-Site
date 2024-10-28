// import { Navigate, useLocation } from 'react-router-dom'

// function CheckAuth({ isAuthenticated, user, children }) {
//   const location = useLocation()

//   console.log(location.pathname, isAuthenticated)

//   if (location.pathname === '/') {
//     if (!isAuthenticated) {
//       return <Navigate to="/auth/login" />
//     } else {
//       if (user?.role === 'admin') {
//         return <Navigate to="/admin/dashboard" />
//       } else {
//         return <Navigate to="/shop/home" />
//       }
//     }
//   }

//   if (
//     !isAuthenticated &&
//     !(
//       location.pathname.includes('/login') ||
//       location.pathname.includes('/register')
//     )
//   ) {
//     return <Navigate to="/auth/login" />
//   }

//   if (
//     isAuthenticated &&
//     (location.pathname.includes('/login') ||
//       location.pathname.includes('/register'))
//   ) {
//     if (user?.role === 'admin') {
//       return <Navigate to="/admin/dashboard" />
//     } else {
//       return <Navigate to="/shop/home" />
//     }
//   }

//   if (
//     isAuthenticated &&
//     user?.role !== 'admin' &&
//     location.pathname.includes('admin')
//   ) {
//     return <Navigate to="/unauth-page" />
//   }

//   if (
//     isAuthenticated &&
//     user?.role === 'admin' &&
//     location.pathname.includes('shop')
//   ) {
//     return <Navigate to="/admin/dashboard" />
//   }

//   return <>{children}</>
// }

// export default CheckAuth

import { Navigate, useLocation } from "react-router-dom";

const routes = {
  login: "/auth/login",
  register: "/auth/register",
  adminDashboard: "/admin/dashboard",
  shopHome: "/shop/home",
  unauthPage: "/unauth-page",
};

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  console.log(location.pathname, isAuthenticated);

  // Redirect from root path
  if (location.pathname === "/") {
    return isAuthenticated ? (
      user?.role === "admin" ? (
        <Navigate to={routes.adminDashboard} />
      ) : (
        <Navigate to={routes.shopHome} />
      )
    ) : (
      <Navigate to={routes.login} />
    );
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