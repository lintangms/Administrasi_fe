import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css';

const DataKaryawan = () => {
  const [karyawanList, setKaryawanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notif, setNotif] = useState({ message: '', type: '', show: false }); // State notifikasi
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newKaryawan, setNewKaryawan] = useState({
    nama: '',
    no_telp: '',
    kode_akun: '',
    status: '',
    kategori: '',
  });

  const [filters, setFilters] = useState({
    nama: '',
    status: '',
    kategori: '',
  });

  const fetchFilteredKaryawan = async () => {
    setLoading(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(`${BACKEND_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: filters,
      });

      setKaryawanList(Array.isArray(response.data.users) ? response.data.users : []);
    } catch (err) {
      console.error('Gagal mengambil data karyawan:', err);
      setError('Gagal mengambil data karyawan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      fetchFilteredKaryawan();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleAddKaryawanChange = (e) => {
    const { name, value } = e.target;
    setNewKaryawan((prev) => ({ ...prev, [name]: value }));
  };

  const validateNewKaryawan = () => {
    const { nama, no_telp, kode_akun, status, kategori } = newKaryawan;
    if (!nama || !no_telp || !kode_akun || !status || !kategori) {
      setError('Semua field wajib diisi.');
      return false;
    }
    return true;
  };

  const handleAddKaryawan = async () => {
    if (!validateNewKaryawan()) return;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/adduser`,
        newKaryawan,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      showNotification('Karyawan berhasil ditambahkan!', 'success');

      setShowAddModal(false);
      setNewKaryawan({
        nama: '',
        no_telp: '',
        kode_akun: '',
        status: '',
        kategori: '',
      });
      setError('');
      fetchFilteredKaryawan();
    } catch (err) {
      console.error('Gagal menambah karyawan:', err);
      showNotification('Gagal menambah karyawan. Cek data Anda.', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotif({ message, type, show: true });
    setTimeout(() => {
      setNotif((prev) => ({ ...prev, show: false }));
    }, 2000);
  };

  return (
    <div className="data-container">
      <h2>Data Karyawan</h2>

      {/* Form Filter */}
      <div className="filter-container">
        <div className="filter-left">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-input kecil"
          >
            <option value="">Semua Status</option>
            <option value="calon">Calon</option>
            <option value="karyawan">Karyawan</option>
          </select>
          <select
            name="kategori"
            value={filters.kategori}
            onChange={handleFilterChange}
            className="filter-input kecil"
          >
            <option value="">Semua Kategori</option>
            <option value="baru">Baru</option>
            <option value="lama">Lama</option>
          </select>
        </div>

        <div className="filter-right">
          <div className="filter-actions">
            <input
              type="text"
              name="nama"
              placeholder="Cari Nama Karyawan"
              value={filters.nama}
              onChange={handleFilterChange}
              className="filter-input"
            />
            <button className="btn-add" onClick={() => setShowAddModal(true)}>
              Tambah Karyawan
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Karyawan</th>
            <th>No Telp</th>
            <th>Kode Akun</th>
            <th>Status</th>
            <th>Kategori</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {!loading && karyawanList.length > 0 ? (
            karyawanList.map((karyawan, index) => (
              <tr key={karyawan.id_karyawan || index}>
                <td>{index + 1}</td>
                <td>{karyawan.nama}</td>
                <td>{karyawan.no_telp}</td>
                <td>{karyawan.kode_akun}</td>
                <td>{karyawan.status}</td>
                <td>{karyawan.kategori}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => {
                      setSelectedKaryawan(karyawan);
                      setShowDetailModal(true);
                    }}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">Tidak ada data karyawan tersedia</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Tambah */}
      {showAddModal && (
        <div className="modal" id="addKaryawanModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tambah Karyawan</h5>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Karyawan</label>
                  <input
                    type="text"
                    name="nama"
                    value={newKaryawan.nama}
                    onChange={handleAddKaryawanChange}
                  />
                </div>
                <div className="form-group">
                  <label>No Telp</label>
                  <input
                    type="text"
                    name="no_telp"
                    value={newKaryawan.no_telp}
                    onChange={handleAddKaryawanChange}
                  />
                </div>
                <div className="form-group">
                  <label>Kode Akun</label>
                  <input
                    type="text"
                    name="kode_akun"
                    value={newKaryawan.kode_akun}
                    onChange={handleAddKaryawanChange}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={newKaryawan.status}
                    onChange={handleAddKaryawanChange}
                  >
                    <option value="">Pilih Status</option>
                    <option value="calon">Calon</option>
                    <option value="karyawan">Karyawan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    name="kategori"
                    value={newKaryawan.kategori}
                    onChange={handleAddKaryawanChange}
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="baru">Baru</option>
                    <option value="lama">Lama</option>
                  </select>
                </div>
                {error && <p className="error-text">{error}</p>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleAddKaryawan}>
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

      {/* Modal Detail */}
      {showDetailModal && selectedKaryawan && (
        <div className="modal" id="detailKaryawanModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Karyawan</h5>
              </div>
              <div className="modal-body">
                <p><strong>Nama:</strong> {selectedKaryawan.nama}</p>
                <p><strong>No Telp:</strong> {selectedKaryawan.no_telp}</p>
                <p><strong>Kode Akun:</strong> {selectedKaryawan.kode_akun}</p>
                <p><strong>Status:</strong> {selectedKaryawan.status}</p>
                <p><strong>Kategori:</strong> {selectedKaryawan.kategori}</p>
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

      {/* Notifikasi */}
      {notif.show && (
        <div className={`notification ${notif.type}`}>
          {notif.message}
        </div>
      )}
    </div>
  );
};

export default DataKaryawan;
