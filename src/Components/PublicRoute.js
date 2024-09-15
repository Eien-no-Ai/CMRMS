import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const role = localStorage.getItem('role');

  // If the user is logged in, redirect based on their role
  if (role) {
    if (role === 'admin') {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/home" />;
  }

  // If not logged in, allow access to public pages like login and signup
  return children;
};

export default PublicRoute;
