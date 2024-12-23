import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Header2({ toggleSidebar, isSidebarCollapsed }) {
  const [nama, setNama] = useState("");
  const navigate = useNavigate();

  const idKaryawan = localStorage.getItem("id_karyawan");

  useEffect(() => {
    const fetchNamaKaryawan = async () => {
      if (!idKaryawan) {
        console.error("id_karyawan tidak ditemukan di localStorage!");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/${idKaryawan}`
        );
        const dataKaryawan = response.data;

        if (dataKaryawan.success) {
          setNama(dataKaryawan.nama);
        } else {
          console.error("Karyawan tidak ditemukan");
        }
      } catch (error) {
        console.error("Gagal mengambil data karyawan:", error);
      }
    };

    fetchNamaKaryawan();
  }, [idKaryawan]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("username");
    localStorage.removeItem("password");

    navigate("/loginadmin");
  };

  return (
    <header
      className="header"
      style={{
        marginLeft: isSidebarCollapsed ? "0" : "250px",
        width: isSidebarCollapsed ? "100%" : "calc(100% - 250px)",
      }}
    >
      <div className="header-left">
        <button className="toggle-btn" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        <h1 className="welcome-text">Selamat Datang, {nama}</h1>
      </div>
      <div className="header-right">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> <span style={{ marginLeft: "10px" }}>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header2;
