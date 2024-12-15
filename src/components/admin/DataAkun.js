import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css';

const DataAkun = () => {
  const [akunList, setAkunList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notif, setNotif] = useState({ message: '', type: '', show: false });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAkun, setNewAkun] = useState({
    nama: '',
    akun_steam: '',
    akun_gmail: '',
    jenis: '',
  });
  const [karyawanOptions, setKaryawanOptions] = useState([]);

  useEffect(() => {
    const fetchAkun = async () => {
      setLoading(true);
      setError('');
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
        const response = await axios.get(`${BACKEND_URL}/api/getakun`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: { page, limit },
        });

        setAkunList(response.data.data || []);
        setTotal(response.data.total || response.data.data.length);
      } catch (err) {
        console.error('Gagal mengambil data akun:', err);
        setError('Gagal mengambil data akun.');
      } finally {
        setLoading(false);
      }
    };

    fetchAkun();
  }, [page, limit]);

  useEffect(() => {
    const fetchKaryawanOptions = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
        const response = await axios.get(`${BACKEND_URL}/api/getnama`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setKaryawanOptions(response.data || []);
      } catch (err) {
        console.error('Gagal mengambil data karyawan:', err);
      }
    };

    fetchKaryawanOptions();
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleAddAkunChange = (e) => {
    const { name, value } = e.target;
    setNewAkun((prev) => ({ ...prev, [name]: value }));
  };

  const validateNewAkun = () => {
    const { nama, akun_steam, akun_gmail, jenis } = newAkun;
    if (!nama || (!akun_steam && !akun_gmail) || !jenis) {
      setError('Nama, akun_steam, akun_gmail, dan jenis wajib diisi');
      return false;
    }
    setError('');
    return true;
  };

  const showNotification = (message, type) => {
    setNotif({ message, type, show: true });
    setTimeout(() => {
      setNotif((prev) => ({ ...prev, show: false }));
    }, 2000);
  };

  const handleAddAkun = async () => {
    if (!validateNewAkun()) return;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/addakun`,
        newAkun,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setAkunList((prevList) => [response.data.karyawan, ...prevList]);
      showNotification('Akun berhasil ditambahkan!', 'success');
      setShowAddModal(false);
      setNewAkun({
        nama: '',
        akun_steam: '',
        akun_gmail: '',
        jenis: '',
      });
      setError('');
    } catch (err) {
      console.error('Gagal menambah akun:', err);
      showNotification('Gagal menambah akun. Cek data Anda.', 'error');
    }
  };

  return (
    <div className="data-container">
      <h2>Daftar Akun Karyawan</h2>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}

      <div>
      <div className="button-container" style={{ textAlign: 'right' }}>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          Tambah Akun
        </button>
      </div></div>

      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Karyawan</th>
            <th>Steam</th>
            <th>Gmail</th>
            <th>Jenis</th>
          </tr>
        </thead>
        <tbody>
          {akunList.length > 0 ? (
            akunList.map((karyawan, index) => (
              <React.Fragment key={index}>
                {karyawan.akun && karyawan.akun.map((akun, akunIndex) => (
                  <tr key={akun.id_akun}>
                    <td>{akunIndex === 0 ? (page - 1) * limit + index + 1 : ''}</td>
                    <td>{akunIndex === 0 ? karyawan.nama : ''}</td>
                    <td>{akun.akun_steam || 'Tidak ada'}</td>
                    <td>{akun.akun_gmail || 'Tidak ada'}</td>
                    <td>{akun.jenis || 'Tidak ditentukan'}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="5">Tidak ada akun tersedia</td>
            </tr>
          )}
        </tbody>
      </table>

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
        </div>
      </div>

      {showAddModal && (
        <div className="modal" id="addAkunModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tambah Akun</h5>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Karyawan</label>
                  <select
                    name="nama"
                    value={newAkun.nama}
                    onChange={handleAddAkunChange}
                    className="form-select"
                  >
                    <option value="">Pilih Nama Karyawan</option>
                    {karyawanOptions.map((karyawan) => (
                      <option key={karyawan.id_karyawan} value={karyawan.nama}>
                        {karyawan.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Akun Steam</label>
                  <input
                    type="text"
                    name="akun_steam"
                    value={newAkun.akun_steam}
                    onChange={handleAddAkunChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Akun Gmail</label>
                  <input
                    type="email"
                    name="akun_gmail"
                    value={newAkun.akun_gmail}
                    onChange={handleAddAkunChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Jenis</label>
                  <select
                    name="jenis"
                    value={newAkun.jenis}
                    onChange={handleAddAkunChange}
                    className="form-select"
                  >
                    <option value="">Pilih Jenis Akun</option>
                    <option value="LA">LA</option>
                    <option value="TNL">TNL</option>
                  </select>
                </div>
                {error && <p className="error-text">{error}</p>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleAddAkun}>
                  Tambah
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notif.show && (
        <div className={`notification ${notif.type}`}>
          {notif.message}
        </div>
      )}
    </div>
  );
};

export default DataAkun;