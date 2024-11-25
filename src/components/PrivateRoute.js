import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('id_karyawan'); // Cek apakah sudah login

  if (!isAuthenticated) {
    return <Navigate to="/loginuser" replace />; // Jika belum login, arahkan ke halaman login
  }

  return children; // Jika sudah login, tampilkan komponen yang diminta
};

export default PrivateRoute;
