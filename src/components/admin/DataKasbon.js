import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css'; // Make sure this CSS file is correctly linked

const DataKasbon = () => {
  const [kasbonList, setKasbonList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedKasbon, setSelectedKasbon] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // State untuk filter dan pagination
  const [filters, setFilters] = useState({
    nama: '',
    tanggal: '',
    cicilan: '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchFilteredKasbon = async () => {
      setLoading(true);
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Ambil URL dari environment variable
        const response = await axios.get(`${BACKEND_URL}/api/allkasbon`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: { ...filters, page, limit },
        });

        if (response.data && response.data.kasbons) {
          setKasbonList(response.data.kasbons);
          setTotal(response.data.total); // Assuming the total count of kasbons is available in response.data.total
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

    fetchFilteredKasbon();
  }, [filters, page, limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleDetailClick = (kasbon) => {
    setSelectedKasbon(kasbon);
    setShowDetailModal(true);
  };

  const handleUpdateClick = (kasbon) => {
    setSelectedKasbon(kasbon);
    setNewStatus(kasbon.status); // Set current status for editing
    setShowUpdateModal(true);
  };

  const handleUpdateStatus = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Ambil URL dari environment variable
      await axios.put(`${BACKEND_URL}/api/updatekasbon/${selectedKasbon.id_kasbon}`, {
        status: newStatus,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setShowUpdateModal(false);
      setSuccessMessage('Status kasbon berhasil diperbarui.');
      setError(''); // Clear any previous error messages
      setTimeout(() => setSuccessMessage(''), 2000); // Clear success message after 2 seconds
      // Refresh data after updating
      setFilters({ ...filters }); // Trigger useEffect to fetch updated data
    } catch (err) {
      console.error('Gagal memperbarui status kasbon:', err);
      setError('Gagal memperbarui status kasbon.');
      setSuccessMessage(''); // Clear any previous success messages
      setTimeout(() => setError(''), 2000); // Clear error after 2 seconds
    }
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
      <h2>Data Kasbon</h2>

      {/* Notification Messages */}
      {successMessage && <div className="notification success">{successMessage}</div>}
      {error && <div className="notification error">{error}</div>}
      

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
          {kasbonList.length > 0 ? (
            kasbonList.map((kasbon, index) => (
              <tr key={kasbon.id_kasbon}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td>{kasbon.nama}</td>
                <td>{kasbon.keperluan}</td>
                <td>{kasbon.nominal}</td>
                <td>{kasbon.cicilan}</td>
                <td>{new Date(kasbon.tanggal).toLocaleString()}</td>
                <td>{kasbon.status}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleDetailClick(kasbon)}
                  >
                    Detail
                  </button>
                  <button
                    className="btn-action"
                    onClick={() => handleUpdateClick(kasbon)}
                  >
                    Update
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
          {/* Tombol Previous */}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            &lt;
          </button>

          {/* Pagination Numbers */}
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

          {/* Tombol Next */}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === Math.ceil(total / limit)}
          >
            &gt;
          </button>
        </div>
      </div>

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

      {showUpdateModal && (
        <div className="modal" id="updateKasbonModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Status Kasbon</h5>
              </div>
              <div className="form-group">
              <label>Status Baru</label>
            <select
              name="status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="form-control"
            >
              <option value="">Pilih Status</option>
              <option value="lunas">Lunas</option>
              <option value="belum_lunas">Belum Lunas</option>
            </select>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateStatus}
                >
                  Simpan
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUpdateModal(false)}
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