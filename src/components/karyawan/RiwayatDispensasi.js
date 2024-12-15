import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Riwayat.css';

const RiwayatDispensasi = () => {
  const [dispensasiList, setDispensasiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDispensasi, setSelectedDispensasi] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notifikasi, setNotifikasi] = useState('');
  const [notifikasiStatus, setNotifikasiStatus] = useState('');

  const [filters, setFilters] = useState({
    nama: '',
    jenis: '',
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

    const fetchDispensasi = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/dispen/${idKaryawan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { ...filters, page, limit },
        });

        if (response.data && response.data.dispensasis && Array.isArray(response.data.dispensasis)) {
          setDispensasiList(response.data.dispensasis);
          setTotal(response.data.total);
        } else {
          setDispensasiList([]);
        }
      } catch (err) {
        console.error('Error saat mengambil data dispensasi:', err);
        setError('Gagal mengambil data dispensasi');
        setDispensasiList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDispensasi();
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

  const handleDetailClick = (dispensasi) => {
    setSelectedDispensasi(dispensasi);
    setShowDetailModal(true);
  };

  const tampilkanNotifikasi = (pesan, status) => {
    setNotifikasi(pesan);
    setNotifikasiStatus(status);

    setTimeout(() => {
      setNotifikasi('');
      setNotifikasiStatus('');
    }, 3000);
  };

  return (
    <div className="riwayat-container">
      <h2>Riwayat Dispensasi</h2>

      {notifikasi && (
        <div className={`notifikasi ${notifikasiStatus}`}>
          {notifikasi}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="riwayat-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Keperluan</th>
              <th>hari</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dispensasiList && dispensasiList.length > 0 ? (
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
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Tidak ada dispensasi tersedia</td>
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
      {showDetailModal && selectedDispensasi && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Dispensasi</h5>
              </div>
              <div className="modal-body">
                <p><strong>Keperluan:</strong> {selectedDispensasi.keperluan}</p>
                <p><strong>hari:</strong> {selectedDispensasi.hari}</p>
                <p><strong>Status:</strong> {selectedDispensasi.status}</p>
                <p><strong>Tanggal:</strong> {new Date(selectedDispensasi.tanggal).toLocaleDateString('id-ID')}</p>
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

export default RiwayatDispensasi;