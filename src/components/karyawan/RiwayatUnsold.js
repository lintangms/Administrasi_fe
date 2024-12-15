import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Riwayat.css';

const RiwayatUnsold = () => {
  const [unsoldList, setUnsoldList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUnsold, setSelectedUnsold] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    jenis: '',
    shift: '',
    tanggal: '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const idKaryawan = localStorage.getItem('id_karyawan');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!idKaryawan || !token) {
      setError('ID Karyawan atau Token tidak valid');
      return;
    }

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    const fetchUnsold = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/getunsoldid/${idKaryawan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { ...filters, page, limit },
        });

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setUnsoldList(response.data.data);
          setTotal(response.data.total);
        } else {
          setUnsoldList([]);
        }
      } catch (err) {
        console.error('Error saat mengambil data unsold:', err);
        setError('Gagal mengambil data unsold');
        setUnsoldList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnsold();
  }, [idKaryawan, token, filters, page, limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleDetailClick = (unsold) => {
    setSelectedUnsold(unsold);
    setShowDetailModal(true);
  };

  return (
    <div className="riwayat-container">
      <h2>Riwayat Unsold</h2>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="riwayat-table">
          <thead>
            <tr>
              <th>No</th>
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
            {unsoldList && unsoldList.length > 0 ? (
              unsoldList.map((unsold, index) => (
                <tr key={unsold.id_unsold}>
                  <td>{(page - 1) * limit + index + 1}</td>
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
      )}

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

      {/* Detail Modal */}
      {showDetailModal && selectedUnsold && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Unsold</h5>
              </div>
              <div className="modal-body">
                <p><strong>Akun Steam:</strong> {selectedUnsold.akun_steam}</p>
                <p><strong>Akun Gmail:</strong> {selectedUnsold.akun_gmail}</p>
                <p><strong>Shift:</strong> {selectedUnsold.shift}</p>
                <p><strong>Jenis:</strong> {selectedUnsold.jenis}</p>
                <p><strong>Jumlah Awal:</strong> {selectedUnsold.jumlah_awal}</p>
                <p><strong>Jumlah Dijual:</strong> {selectedUnsold.jumlah_dijual}</p>
                <p><strong>Jumlah Sisa:</strong> {selectedUnsold.jumlah_sisa}</p>
                <p><strong>Waktu:</strong> {new Date(selectedUnsold.waktu).toLocaleString()}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
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

export default RiwayatUnsold;
