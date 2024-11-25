import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css'; // Pastikan file CSS ada di jalur ini

const DataKasbon = () => {
  const [kasbonList, setKasbonList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedKasbon, setSelectedKasbon] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // State untuk filter
  const [filters, setFilters] = useState({
    nama: '',
    tanggal: '',
    cicilan: '', // Tambahkan cicilan ke state filter
  });
  useEffect(() => {
    const fetchFilteredKasbon = async () => {
      setLoading(true);
      try {
        // Mengambil URL dari environment variable
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

        const response = await axios.get(`${BACKEND_URL}/api/allkasbon`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: filters, // Kirimkan filter sebagai parameter
        });

        console.log('Respons dari API Kasbon:', response.data);

        if (Array.isArray(response.data.data)) {
          setKasbonList(response.data.data);
        } else {
          setKasbonList([]);
        }
      } catch (err) {
        console.error('Gagal mengambil data kasbon:', err);
        setError('Gagal mengambil data kasbon.');
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchFilteredKasbon();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [filters]);

  // Fungsi untuk menangani perubahan filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // Fungsi untuk menampilkan detail kasbon
  const handleDetailClick = (kasbon) => {
    setSelectedKasbon(kasbon);
    setShowDetailModal(true);
  };

  // Menampilkan pesan loading atau error jika ada
  if (loading) return <p className="loading-text">Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="data-container">
      <h2>Data Kasbon</h2>

      {/* Form Filter */}
      <div className="filter-container">
        <div className="filter-left">
        <select
            name="cicilan"
            value={filters.cicilan}
            onChange={handleFilterChange}
            className="filter-input"
          >
            <option value="">Semua Cicilan</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>  
          </select>
          <input
            type="date"
            name="tanggal"
            value={filters.tanggal}
            onChange={handleFilterChange}
            className="filter-input kecil"
          />
        </div>
        <div className="filter-right">
          <input
            type="text"
            name="nama"
            placeholder="Cari Nama Karyawan"
            value={filters.nama}
            onChange={handleFilterChange}
            className="filter-input"
          />

        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Karyawan</th>
            <th>Keperluan</th>
            <th>Nominal</th>
            <th>Cicilan</th>
            <th>Tanggal</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {!loading && kasbonList && kasbonList.length > 0 ? (
            kasbonList.map((kasbon, index) => (
              <tr key={kasbon.id_kasbon || index}>
                <td>{index + 1}</td>
                <td className="nama">{kasbon.nama || 'Tidak tersedia'}</td>
                <td>{kasbon.keperluan || 'Tidak tersedia'}</td>
                <td>{kasbon.nominal || 'Tidak tersedia'}</td>
                <td>{kasbon.cicilan || 'Tidak tersedia'}</td>
                <td>{new Date(kasbon.tanggal).toLocaleString()}</td>
                <td>{kasbon.status || 'Tidak tersedia'}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleDetailClick(kasbon)}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">Tidak ada data kasbon tersedia</td>
            </tr>
          )}
        </tbody>
      </table>

      {showDetailModal && (
        <div className="modal" id="detailKasbonModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Kasbon</h5>
              </div>
              <div className="modal-body">
                <p><strong>Nama Karyawan:</strong> {selectedKasbon?.nama}</p>
                <p><strong>Keperluan:</strong> {selectedKasbon?.keperluan}</p>
                <p><strong>Nominal:</strong> {selectedKasbon?.nominal}</p>
                <p><strong>Cicilan:</strong> {selectedKasbon?.cicilan}</p>
                <p><strong>Tanggal:</strong> {new Date(selectedKasbon?.tanggal).toLocaleString()}</p>
                <p><strong>Status:</strong> {selectedKasbon?.status}</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataKasbon;
