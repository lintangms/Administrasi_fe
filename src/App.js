import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import SidebarUser from './components/sidebar/sidebaruser'; // Sidebar untuk karyawan
import SidebarAdmin from './components/sidebar/sidebaradmin'; // Sidebar untuk admin
import LoginPage from './components/karyawan/LoginPage';
import KaryawanDashboard from './components/karyawan/KaryawanDashboard';
import Header1 from './components/sidebar/header1'; // Header untuk karyawan
import Header2 from './components/sidebar/header2'; // Header untuk admin
import Absensi from './components/karyawan/Absensi';
import Riwayat from './components/karyawan/Riwayat';
import Kasbon from "./components/karyawan/Kasbon.js";
import LoginAdmin from './components/admin/LoginAdmin';
import AdminDashboard from './components/admin/AdminDashboard';
import Data from './components/admin/Data';
import PrivateRoute from './components/PrivateRoute';  // Impor PrivateRoute untuk user
import PrivateRouteAdmin from './components/PrivateRouteAdmin.js';
import RiwayatKasbon from "./components/karyawan/RiwayatKasbon.js";  // Impor PrivateRouteAdmin untuk admin
import DataKaryawan from "./components/admin/DataKaryawan.js";
import DataKasbon from "./components/admin/DataKasbon.js";
import HitungGaji from "./components/admin/HitungGaji.js";

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State untuk sidebar
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prevState => !prevState);
  };

  const noSidebarAndHeaderPages = ['/loginuser', '/loginadmin']; // Halaman yang tidak menampilkan sidebar dan header
  const isNoSidebarAndHeaderPage = noSidebarAndHeaderPages.includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div style={{ ...styles.container, marginLeft: isNoSidebarAndHeaderPage || isSidebarCollapsed ? '0' : '250px' }}>
      {/* Menampilkan Header berdasarkan tipe pengguna */}
      {!isNoSidebarAndHeaderPage && (isAdminPage ? (
        <Header2 toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
      ) : (
        <Header1 toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
      ))}

      {/* Menampilkan Sidebar berdasarkan tipe pengguna */}
      {!isNoSidebarAndHeaderPage && (isAdminPage ? (
        <SidebarAdmin isCollapsed={isSidebarCollapsed} />
      ) : (
        <SidebarUser isCollapsed={isSidebarCollapsed} />
      ))}

      {/* Main content yang di sebelah kanan */}
      <div style={{ ...styles.mainContent, marginTop: isNoSidebarAndHeaderPage ? '0' : '80px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/loginuser" replace />} />
          <Route path="/loginuser" element={<LoginPage />} />
          <Route path="/loginadmin" element={<LoginAdmin />} />

          {/* Menggunakan PrivateRoute untuk halaman yang membutuhkan login user */}
          <Route path="/user/dashboard" element={
            <PrivateRoute>
              <KaryawanDashboard />
            </PrivateRoute>
          } />
          <Route path="/user/absensi" element={
            <PrivateRoute>
              <Absensi />
            </PrivateRoute>
          } />
          <Route path="/user/riwayat" element={
            <PrivateRoute>
              <Riwayat />
            </PrivateRoute>
          } />
          <Route path="/user/kasbon" element={
            <PrivateRoute>
              <Kasbon />
            </PrivateRoute>
          } />
          <Route path="/user/riwayatkasbon" element={
            <PrivateRoute>
              <RiwayatKasbon />
            </PrivateRoute>
          } />

          {/* Menggunakan PrivateRouteAdmin untuk halaman yang membutuhkan akses admin */}
          <Route path="/admin/dashboard" element={
            <PrivateRouteAdmin>
              <AdminDashboard />
            </PrivateRouteAdmin>
          } />
          <Route path="/admin/data" element={
            <PrivateRouteAdmin>
              <Data />
            </PrivateRouteAdmin>
          } />
          <Route path="/admin/datakaryawan" element={
            <PrivateRouteAdmin>
              <DataKaryawan />
            </PrivateRouteAdmin>
          } />
          <Route path="/admin/datakasbon" element={
            <PrivateRouteAdmin>
              <DataKasbon />
            </PrivateRouteAdmin>
          } />
          <Route path="/admin/hitunggaji" element={
            <PrivateRouteAdmin>
              <HitungGaji />
            </PrivateRouteAdmin>
          } />
        </Routes>
      </div>
    </div>
  );
}

// Styling menggunakan Flexbox
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    transition: 'margin-left 0.3s ease',
    flexDirection: 'column',
  },
  mainContent: {
    flex: 1,
    padding: '20px',
    transition: 'margin-top 0.3s ease',
  },
};

export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}
