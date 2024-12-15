import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css'; // Make sure this CSS file is correctly linked

const DataDispensasi = () => {
  const [dispensasiList, setDispensasiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedDispensasi, setSelectedDispensasi] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // State untuk filter dan pagination
  const [filters, setFilters] = useState({
    keperluan: '',
    hari: '',
    status: '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchFilteredDispensasi = async () => {
      setLoading(true);
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Ambil URL dari environment variable
        const response = await axios.get(`${BACKEND_URL}/api/alldispen`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: { ...filters, page, limit },
        });

        if (response.data && response.data.dispensasis) {
          setDispensasiList(response.data.dispensasis);
          setTotal(response.data.total); // Assuming the total count of dispensasi is available in response.data.total
        } else {
          setDispensasiList([]);
        }
      } catch (err) {
        console.error('Gagal mengambil data dispensasi:', err);
        setError('Gagal mengambil data dispensasi.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredDispensasi();
  }, [filters, page, limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleDetailClick = (dispensasi) => {
    setSelectedDispensasi(dispensasi);
    setShowDetailModal(true);
  };

  const handleUpdateClick = (dispensasi) => {
    setSelectedDispensasi(dispensasi);
    setNewStatus(dispensasi.status); // Set current status for editing
    setShowUpdateModal(true);
  };

  const handleUpdateStatus = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Ambil URL dari environment variable
      await axios.put(`${BACKEND_URL}/api/updatedispen/${selectedDispensasi.id_dispensasi}`, {
        status: newStatus,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setShowUpdateModal(false);
      setSuccessMessage('Status dispensasi berhasil diperbarui.');
      setError(''); // Clear any previous error messages
      setTimeout(() => setSuccessMessage(''), 2000); // Clear success message after 2 seconds
      // Refresh data after updating
      setFilters({ ...filters }); // Trigger useEffect to fetch updated data
    } catch (err) {
      console.error('Gagal memperbarui status dispensasi:', err);
      setError('Gagal memperbarui status dispensasi.');
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
      <h2>Data Dispensasi</h2>

      {/* Notification Messages */}
      {successMessage && <div className="notification success">{successMessage}</div>}
      {error && <div className="notification error">{error}</div> }

      {/* Form Filter
      <div className="filter-container">
        <div className="filter-left">
          <input
            type="text"
            name="keperluan"
            placeholder="Cari Keperluan"
            value={filters.keperluan}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <select
            name="hari"
            value={filters.hari}
            onChange={handleFilterChange}
            className="filter-input"
          >
            <option value="">Semua Hari</option>
            <option value="Senin">Senin</option>
            <option value="Selasa">Selasa</option>
            <option value="Rabu">Rabu</option>
            <option value="Kamis">Kamis</option>
            <option value="Jumat">Jumat</option>
            <option value="Sabtu">Sabtu</option>
            <option value="Minggu">Minggu</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-input"
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>
      </div> */}

      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Keperluan</th>
            <th>Hari</th>
            <th>Status</th>
            <th>Tanggal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {dispensasiList.length > 0 ? (
            dispensasiList.map((dispensasi, index) => (
              <tr key={dispensasi.id_dispensasi}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td>{dispensasi.keperluan}</td>
                <td>{dispensasi.hari}</td>
                <td>{dispensasi.status}</td>
                <td>{new Date(dispensasi.tanggal).toLocaleDateString('id-ID')}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleDetailClick(dispensasi)}
                  >
                    Detail
                  </button>
                  <button
                    className="btn-action"
                    onClick={() => handleUpdateClick(dispensasi)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">Tidak ada data dispensasi tersedia</td>
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

          {[...Array(Math.ceil(total / limit)).keys()].map((num) => {
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
            disabled={page === Math.ceil(total / limit)}
          >
            &gt;
          </button>
        </div>
      </div>

      {showDetailModal && (
        <div className="modal" id="detailDispensasiModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Dispensasi</h5>
              </div>
              <div className="modal-body">
                <p><strong>Keperluan:</strong> {selectedDispensasi?.keperluan}</p>
                <p><strong>Hari:</strong> {selectedDispensasi?.hari}</p>
                <p><strong>Status:</strong> {selectedDispensasi?.status}</p>
                <p><strong>Tanggal:</strong>{new Date(selectedDispensasi.tanggal).toLocaleDateString('id-ID')}</p>
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
        <div className="modal" id="updateDispensasiModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Status Dispensasi</h5>
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
                  <option value="disetujui">Setujui</option>
                  <option value="ditolak">Tolak</option>
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

export default DataDispensasi;