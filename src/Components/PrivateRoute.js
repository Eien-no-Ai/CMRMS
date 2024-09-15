import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('role');

  // Redirect to login if no role is found (logged out)
  if (!role) {
    return <Navigate to="/login" />;
  }

  // Check if the user's role is in the allowed roles array
  if (allowedRoles.includes(role)) {
    return children;
  } else if (role === 'admin') {
    return <Navigate to="/admin" />;
  } else {
    return <Navigate to="/home" />;
  }
};

export default PrivateRoute;
