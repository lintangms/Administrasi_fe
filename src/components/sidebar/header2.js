import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

function Header2({ toggleSidebar, isSidebarCollapsed }) {
  const [nama, setNama] = useState("");

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

  return (
    <header
      className="header"
      style={{
        marginLeft: isSidebarCollapsed ? "0" : "250px", // Menyesuaikan dengan sidebar
        width: isSidebarCollapsed ? "100%" : "calc(100% - 250px)", // Mengatur lebar header
      }}
    >
      <button className="toggle-btn" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} /> {/* Menampilkan ikon bars */}
      </button>
      <h1>Selamat Datang, {nama}</h1>
    </header>
  );
}

export default Header2;
