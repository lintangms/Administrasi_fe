import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css'; // Pastikan file CSS telah diperbarui sesuai kebutuhan

const Absensi = () => {
  const [absensiList, setAbsensiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    nama: '',
    jenis: '',
    tanggal: '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchAbsensi = async () => {
      setLoading(true);
      setError(''); // Reset error setiap kali kita memulai fetch baru
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Ambil URL dari environment variable
        const response = await axios.get(`${BACKEND_URL}/api/transaksi/getabsensi`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: { ...filters, page, limit },
        });
        setAbsensiList(response.data.data);
        setTotal(response.data.total);
      } catch (err) {
        console.error('Gagal mengambil data absensi:', err);
        setError('Gagal mengambil data absensi.');
      } finally {
        setLoading(false);
      }
    };

    fetchAbsensi();
  }, [filters, page, limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    setPage(1); // Reset ke halaman pertama saat filter berubah
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset ke halaman pertama saat limit berubah
  };

  const totalPages = Math.ceil(total / limit) || 1; // Pastikan totalPages tidak 0

  return (
    <div className="data-container">
      <h2>Data Absensi</h2>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading Indicator */}
      {loading && <div className="loading-message">Loading...</div>}

      {/* Form Filter */}
      <div className="filter-container">
        <div className="filter-left">
          <input
            type="date"
            name="tanggal"
            value={filters.tanggal}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <select
            name="jenis"
            value={filters.jenis}
            onChange={handleFilterChange}
            className="filter-input"
          >
            <option value="">Semua Jenis</option>
            <option value="LA">LA</option>
            <option value="TNL">TNL</option>
          </select>
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
            <th>Jenis Game</th>
            <th>Jumlah Awal</th>
            <th>Jumlah Dijual</th>
            <th>Jumlah Sisa</th>
            <th>Shift </th>
            <th>Keterangan</th>
            <th>Waktu</th>
            <th>Jam Kerja</th>
          </tr>
        </thead>
        <tbody>
          {absensiList.length > 0 ? (
            absensiList.map((absensi, index) => (
              <tr key={index}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td className="nama">{absensi.nama_karyawan}</td>
                <td>{absensi.jenis}</td>
                <td className="koin">{absensi.jumlah_awal}</td>
                <td className="koin">{absensi.jumlah_dijual}</td>
                <td className="koin">{absensi.jumlah_sisa}</td>
                <td>
                  <span className={`shift ${absensi.shift.toLowerCase()} shift`}>
                    {absensi.shift}
                  </span>
                </td>
                <td>
                  <span className={`keterangan ${absensi.keterangan.toLowerCase()}`}>
                    {absensi.keterangan}
                  </span>
                </td>
                <td>{new Date(absensi.waktu).toLocaleString()}</td>
                <td>{absensi.jam_kerja || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">Tidak ada data absensi tersedia</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-left">
          <label>Jumlah Data:</label>
          <select value={limit} onChange={handleLimitChange} className="small-select">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={total}>Semua</option>
          </select>
        </div>
        <div className="pagination-right">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            &lt;
          </button>

          {[...Array(totalPages).keys()].map((num) => {
            const pageNumber = num + 1;
            return (
              <button
                key={pageNumber}
                className={`pagination-btn ${page === pageNumber ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Absensi;