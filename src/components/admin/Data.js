import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css'; // Pastikan file CSS telah diperbarui sesuai kebutuhan

const Data = () => {
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // State untuk filter
  const [filters, setFilters] = useState({
    nama: '',
    jenis: '',
    tanggal: '',
  });

  useEffect(() => {
    const fetchFilteredTransaksi = async () => {
      setLoading(true);
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Ambil URL dari environment variable
        const response = await axios.get(`${BACKEND_URL}/transaksi/filter`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: filters, // Kirim parameter filter sesuai kebutuhan
        });
        setTransaksiList(response.data.data);
      } catch (err) {
        console.error('Gagal mengambil data transaksi:', err);
        setError('Gagal mengambil data transaksi.');
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchFilteredTransaksi();
    }, 300); // Debounce delay 300ms

    return () => clearTimeout(debounceFetch);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleDetailClick = (transaksi) => {
    setSelectedTransaksi(transaksi);
    setShowDetailModal(true);
  };

  if (loading) return <p className="loading-text">Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="data-container">
      <h2>Riwayat Transaksi</h2>

      {/* Form Filter */}
      <div className="filter-container">
        <div className="filter-left">
          <input
            type="date"
            name="tanggal"
            value={filters.tanggal}
            onChange={handleFilterChange}
            className="filter-input kecil"
          />
          <select
            name="jenis"
            value={filters.jenis}
            onChange={handleFilterChange}
            className="filter-input kecil"
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
            <th>Shift</th>
            <th>Keterangan</th>
            <th>Waktu</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {transaksiList.length > 0 ? (
            transaksiList.map((transaksi, index) => (
              <tr key={transaksi.id_transaksi}>
                <td>{index + 1}</td>
                <td className="nama">{transaksi.nama}</td>
                <td>
                  <span className={`jenis-game ${transaksi.jenis.toLowerCase()} jenis`}>
                    {transaksi.jenis}
                  </span>
                </td>
                <td className="koin">{transaksi.jumlah_awal}</td>
                <td className="koin">{transaksi.jumlah_dijual}</td>
                <td className="koin">{transaksi.jumlah_sisa}</td>
                <td>
                  <span className={`shift ${transaksi.shift.toLowerCase()} shift`}>
                    {transaksi.shift}
                  </span>
                </td>
                <td>
                  <span
                    className={`keterangan ${
                      transaksi.keterangan.toLowerCase() === 'masuk' ? 'masuk' : 'pulang'
                    }`}
                  >
                    {transaksi.keterangan}
                  </span>
                </td>
                <td>{new Date(transaksi.waktu).toLocaleString()}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleDetailClick(transaksi)}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12">Tidak ada transaksi tersedia</td>
            </tr>
          )}
        </tbody>
      </table>

      {showDetailModal && (
        <div className="modal" id="detailTransaksiModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Transaksi</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowDetailModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Nama Karyawan:</strong> {selectedTransaksi?.nama}</p>
                <p><strong>Akun Steam:</strong> {selectedTransaksi?.akun_steam}</p>
                <p><strong>Akun Gmail:</strong> {selectedTransaksi?.akun_gmail}</p>
                <p><strong>Jenis Game:</strong> {selectedTransaksi?.jenis}</p>
                <p><strong>Jumlah Awal:</strong> {selectedTransaksi?.jumlah_awal}</p>
                <p><strong>Jumlah Dijual:</strong> {selectedTransaksi?.jumlah_dijual}</p>
                <p><strong>Jumlah Sisa:</strong> {selectedTransaksi?.jumlah_sisa}</p>
                <p><strong>Shift:</strong> {selectedTransaksi?.shift}</p>
                <p><strong>Keterangan:</strong> {selectedTransaksi?.keterangan}</p>
                <p><strong>Waktu:</strong> {new Date(selectedTransaksi?.waktu).toLocaleString()}</p>
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

export default Data;
