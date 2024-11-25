import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwt-decode

const PrivateRouteAdmin = ({ children }) => {
  const token = localStorage.getItem('admin_token'); // Get the token from localStorage

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/loginadmin" replace />;
  }

  try {
    // Decode the token to get the user data
    const decodedToken = jwtDecode(token); // Correct usage of jwtDecode function
    const userRole = decodedToken.role; // Assuming your token contains the 'role'

    if (userRole !== 'admin') {
      // If the user is not an admin, redirect to login
      return <Navigate to="/loginadmin" replace />;
    }
  } catch (error) {
    // If decoding fails, redirect to login
    return <Navigate to="/loginadmin" replace />;
  }

  return children; // If user is admin, render the children (protected route)
};

export default PrivateRouteAdmin;
