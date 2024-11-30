import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css';

const DataKaryawan = () => {
  const [karyawanList, setKaryawanList] = useState([]);
  const [error, setError] = useState('');
  const [notif, setNotif] = useState({ message: '', type: '', show: false }); // State notifikasi
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

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

  // State untuk filter dan pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchFilteredKaryawan = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(`${BACKEND_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: { ...filters, page, limit },
      });

      // Mengurutkan data berdasarkan tanggal atau ID jika diperlukan
      setKaryawanList(response.data.users);
      setTotal(response.data.total); // Mengasumsikan API mengirimkan jumlah total data
    } catch (err) {
      console.error('Gagal mengambil data karyawan:', err);
      setError('Gagal mengambil data karyawan.');
    }
  };

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      fetchFilteredKaryawan();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [filters, page, limit]);

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
    setError(''); // Reset error jika semua valid
    return true;
  };

  const handleAddKaryawan = async () => {
    if (!validateNewKaryawan()) return; // Melakukan validasi terlebih dahulu

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

      setError(''); // Clear error message

      // Menambahkan karyawan baru di posisi paling atas (tanpa memanggil API lagi)
      setKaryawanList((prevList) => [response.data, ...prevList]);

      // Call fetchFilteredKaryawan again to ensure data is updated
      setTimeout(() => {
        fetchFilteredKaryawan();
      }, 500); // Berikan sedikit delay untuk memastikan state ter-update
    } catch (err) {
      console.error('Gagal menambah karyawan:', err);
      showNotification('Gagal menambah karyawan. Cek data Anda.', 'error');
    }
  };

  const handleDeleteKaryawan = async (id_karyawan) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_BACKEND_URL}/api/delete/${id_karyawan}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        showNotification('Karyawan berhasil dihapus!', 'success');
    
        // Menghapus karyawan dari state setelah penghapusan
        setKaryawanList((prevList) =>
          prevList.filter((karyawan) => karyawan.id_karyawan !== id_karyawan)
        );
      } catch (err) {
        console.error('Gagal menghapus karyawan:', err);
        showNotification('Gagal menghapus karyawan. Coba lagi.', 'error');
      }
    }
  };
  

  const [updatedKaryawan, setUpdatedKaryawan] = useState({
    nama: '',
    no_telp: '',
    kode_akun: '',
    status: '',
    kategori: '',
  });

  const handleUpdateKaryawanClick = (karyawan) => {
    setSelectedKaryawan(karyawan);
    setUpdatedKaryawan({
      nama: karyawan.nama,
      no_telp: karyawan.no_telp,
      kode_akun: karyawan.kode_akun,
      status: karyawan.status,
      kategori: karyawan.kategori,
    });
    setShowUpdateModal(true);
  };

  const validateUpdatedKaryawan = () => {
    const { nama, no_telp, kode_akun, status, kategori } = updatedKaryawan;
    if (!nama || !no_telp || !kode_akun || !status || !kategori) {
      setError('Semua field wajib diisi.');
      return false;
    }
    setError(''); // Reset error jika semua valid
    return true;
  };

  const handleUpdateKaryawan = async () => {
    if (!validateUpdatedKaryawan()) return;

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/update/${selectedKaryawan.id_karyawan}`,
        updatedKaryawan,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      showNotification('Karyawan berhasil diupdate!', 'success');
      setShowUpdateModal(false);
      setSelectedKaryawan(null);

      setKaryawanList((prevList) =>
        prevList.map((karyawan) =>
          karyawan.id_karyawan === response.data.id_karyawan ? response.data : karyawan
        )
      );

      setTimeout(() => {
        fetchFilteredKaryawan();
      }, 500);
    } catch (err) {
      console.error('Gagal mengupdate karyawan:', err);
      showNotification('Gagal mengupdate karyawan. Cek data Anda.', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotif({ message, type, show: true });
    setTimeout(() => {
      setNotif((prev) => ({ ...prev, show: false }));
    }, 2000);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset ke halaman pertama saat limit berubah
  };

  const handleUpdateKaryawanChange = (e) => {
    const { name, value } = e.target;
    setUpdatedKaryawan((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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
          {karyawanList.length > 0 ? (
            karyawanList.map((karyawan, index) => (
              <tr key={karyawan.id_karyawan || index}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td>{karyawan.nama}</td>
                <td>{karyawan.no_telp}</td>
                <td>{karyawan.kode_akun}</td>
                <td>{karyawan.status}</td>
                <td>{karyawan.kategori}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleUpdateKaryawanClick(karyawan)}
                  >
                    Update
                  </button>
                  <button
                    className="btn-action btn-delete"
                    onClick={() => handleDeleteKaryawan(karyawan.id_karyawan)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">Tidak ada karyawan ditemukan</td>
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
          {/* Previous Button */}
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

          {/* Next Button */}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === Math.ceil(total / limit)}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Modal Update */}
      {showUpdateModal && (
        <div className="modal" id="updateKaryawanModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Karyawan</h5>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Karyawan</label>
                  <input
                    type="text"
                    name="nama"
                    value={updatedKaryawan.nama}
                    onChange={handleUpdateKaryawanChange}
                  />
                </div>
                <div className="form-group">
                  <label>No Telp</label>
                  <input
                    type="text"
                    name="no_telp"
                    value={updatedKaryawan.no_telp}
                    onChange={handleUpdateKaryawanChange}
                  />
                </div>
                <div className="form-group">
                  <label>Kode Akun</label>
                  <input
                    type="text"
                    name="kode_akun"
                    value={updatedKaryawan.kode_akun}
                    onChange={handleUpdateKaryawanChange}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={updatedKaryawan.status}
                    onChange={handleUpdateKaryawanChange}
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
                    value={updatedKaryawan.kategori}
                    onChange={handleUpdateKaryawanChange}
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="baru">Baru</option>
                    <option value="lama">Lama</option>
                  </select>
                </div>
                {error && <p className="error-text">{error}</p>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleUpdateKaryawan}>
                  Update
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

      {/* Notification */}
      {notif.show && (
        <div className={`notification ${notif.type}`}>
          {notif.message}
        </div>
      )}
    </div>
  );
};

export default DataKaryawan;