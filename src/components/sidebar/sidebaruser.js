import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../css/Sidebaruser.css";
import { FaHome, FaClipboardList, FaHistory, FaSignOutAlt, FaMoneyCheckAlt, FaCoins } from "react-icons/fa";

const SidebarUser = ({ isCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("kode_akun");
    localStorage.removeItem("id_karyawan");
    navigate("/loginuser");
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logo"></div>
      <nav>
        <ul>
          <li>
            <Link
              to="/user/dashboard"
              className={location.pathname === "/user/dashboard" ? "active" : ""}
            >
              <FaHome /> <span style={{ marginLeft: "10px" }}>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/user/absensi"
              className={location.pathname === "/user/absensi" ? "active" : ""}
            >
              <FaClipboardList /> <span style={{ marginLeft: "10px" }}>Absensi</span>
            </Link>
          </li>
          <li>
            <Link
              to="/user/riwayat"
              className={location.pathname === "/user/riwayat" ? "active" : ""}
            >
              <FaHistory /> <span style={{ marginLeft: "10px" }}>Riwayat</span>
            </Link>
          </li>
          <li>
            <Link
              to="/user/kasbon"
              className={location.pathname === "/user/kasbon" ? "active" : ""}
            >
              <FaMoneyCheckAlt /> <span style={{ marginLeft: "10px" }}>Kasbon</span>
            </Link>
          </li>
          <li>
            <Link
              to="/user/riwayatkasbon"
              className={location.pathname === "/user/riwayatkasbon" ? "active" : ""}
            >
              <FaCoins /> <span style={{ marginLeft: "10px" }}>Riwayat Kasbon</span>
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

export default SidebarUser;
