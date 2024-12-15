import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css'; // Pastikan file CSS ini sudah ada dan terhubung

const DataUnsold = () => {
  const [unsoldList, setUnsoldList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedUnsold, setSelectedUnsold] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // State untuk filter dan pagination
  const [filters, setFilters] = useState({
    id_karyawan: '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchFilteredUnsold = async () => {
      setLoading(true);
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Ambil URL dari environment variable
        const response = await axios.get(`${BACKEND_URL}/api/getunsold`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: { ...filters, page, limit },
        });

        if (response.data && response.data.data) {
          setUnsoldList(response.data.data);
          setTotal(response.data.total); // Mengambil total data untuk pagination
        } else {
          setUnsoldList([]);
        }
      } catch (err) {
        console.error('Gagal mengambil data unsold:', err);
        setError('Gagal mengambil data unsold.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredUnsold();
  }, [filters, page, limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleDetailClick = (unsold) => {
    setSelectedUnsold(unsold);
    setShowDetailModal(true);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset ke halaman pertama saat limit berubah
  };

  return (
    <div className="data-container">
      <h2>Data Unsold</h2>

      {/* Notification Messages */}
      {successMessage && <div className="notification success">{successMessage}</div>}
      {error && <div className="notification error">{error}</div>}

      {/* Form Filter */}
      <div className="filter-container">
        <input
          type="text"
          name="id_karyawan"
          placeholder="Cari ID Karyawan"
          value={filters.id_karyawan}
          onChange={handleFilterChange}
          className="filter-input"
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Akun Steam</th>
            <th>Akun Gmail</th>
            <th>Shift</th>
            <th>Jenis</th>
            <th>Jumlah Awal</th>
            <th>Jumlah Dijual</th>
            <th>Jumlah Sisa</th>
            <th>Waktu</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {unsoldList.length > 0 ? (
            unsoldList.map((unsold, index) => (
              <tr key={unsold.id_unsold}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td>{unsold.nama}</td>
                <td>{unsold.akun_steam}</td>
                <td>{unsold.akun_gmail}</td>
                <td>{unsold.shift}</td>
                <td>{unsold.jenis}</td>
                <td>{unsold.jumlah_awal}</td>
                <td>{unsold.jumlah_dijual}</td>
                <td>{unsold.jumlah_sisa}</td>
                <td>{new Date(unsold.waktu).toLocaleString()}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleDetailClick(unsold)}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">Tidak ada data unsold tersedia</td>
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
  {total > 0 && limit > 0 && (
    <>
      <button
        className="pagination-btn"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      >
        &lt;
      </button>
      {[...Array(Math.ceil(total / limit)).keys()].map((num) => {
        const pageNumber = num + 1;
        if (
          pageNumber === 1 ||
          pageNumber === Math.ceil(total / limit) ||
          (pageNumber >= page - 2 && pageNumber <= page + 2)
        ) {
          return (
            <button
              key={pageNumber}
              className={`pagination-btn ${page === pageNumber ? 'active' : ''}`}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          );
        } else if (
          (pageNumber === page - 3 || pageNumber === page + 3) &&
          (pageNumber !== 1 && pageNumber !== Math.ceil(total / limit))
        ) {
          return <span key={pageNumber}>...</span>;
        }
        return null;
      })}
      <button
        className="pagination-btn"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === Math.ceil(total / limit)}
      >
        &gt;
      </button>
    </>
  )}
</div>

      </div>

      {showDetailModal && (
        <div className="modal" id="detailUnsoldModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Unsold</h5>
              </div>
              <div className="modal-body">
              <p><strong>Nama:</strong> {selectedUnsold?.nama}</p>
                <p><strong>Akun Steam:</strong> {selectedUnsold?.akun_steam}</p>
                <p><strong>Akun Gmail:</strong> {selectedUnsold?.akun_gmail}</p>
                <p><strong>Shift:</strong> {selectedUnsold?.shift}</p>
                <p><strong>Jenis:</strong> {selectedUnsold?.jenis}</p>
                <p><strong>Jumlah Awal:</strong> {selectedUnsold?.jumlah_awal}</p>
                <p><strong>Jumlah Dijual:</strong> {selectedUnsold?.jumlah_dijual}</p>
                <p><strong>Jumlah Sisa:</strong> {selectedUnsold?.jumlah_sisa}</p>
                <p><strong>Waktu:</strong> {new Date(selectedUnsold?.waktu).toLocaleString()}</p>
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

export default DataUnsold;
