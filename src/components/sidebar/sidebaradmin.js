import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../css/Sidebaruser.css";
import { FaHome, FaClipboardList, FaSignOutAlt,FaUsers, FaMoneyCheckAlt, FaMoneyBillAlt } from "react-icons/fa";

const SidebarAdmin = ({ isCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Hapus semua data yang terkait dengan admin dari localStorage
    localStorage.removeItem("admin_token");
    localStorage.removeItem("username"); // Jika ada data username yang disimpan
    localStorage.removeItem("password"); // Jika ada data password yang disimpan

    // Arahkan pengguna ke halaman login admin
    navigate("/loginadmin");
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logo"></div>
      <nav>
        <ul>
          <li>
            <Link
              to="/admin/dashboard"
              className={location.pathname === "/admin/dashboard" ? "active" : ""}
            >
              <FaHome /> <span style={{ marginLeft: "10px" }}>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/data"
              className={location.pathname === "/admin/data" ? "active" : ""}
            >
              <FaClipboardList /> <span style={{ marginLeft: "10px" }}>Data Game</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/datakaryawan"
              className={location.pathname === "/admin/datakaryawan" ? "active" : ""}
            >
              <FaUsers /> <span style={{ marginLeft: "10px" }}>Data Karyawan</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/datakasbon"
              className={location.pathname === "/admin/datakasbon" ? "active" : ""}
            >
              <FaMoneyCheckAlt /> <span style={{ marginLeft: "10px" }}>Data Kasbon</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/hitunggaji"
              className={location.pathname === "/admin/hitunggaji" ? "active" : ""}
            >
              <FaMoneyBillAlt /> <span style={{ marginLeft: "10px" }}>Hitung Gaji</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="logout">
        <button onClick={handleLogout}>
          <FaSignOutAlt /> <span style={{ marginLeft: "10px" }}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarAdmin;
