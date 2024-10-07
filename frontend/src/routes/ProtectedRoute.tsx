// ProtectedRoute.tsx

import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");
  // const { isLoggedIn, role } = useAppContext();

  if (!isLoggedIn || !role || !roles.includes(role)) {
    console.log("ProtectedRoute: ", isLoggedIn, role);
    return <Navigate to="/sign-in" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
