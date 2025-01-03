import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css';

const DataGaji = () => {
  const [gajiList, setGajiList] = useState([]);
  const [karyawanList, setKaryawanList] = useState([]);
  const [error, setError] = useState('');
  const [notif, setNotif] = useState({ message: '', type: '', show: false });
  const [selectedGaji, setSelectedGaji] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [newGaji, setNewGaji] = useState({
    nama: '',
    koin: '',
    unsold: '',
    rate: '',
    tanggal: '',
  });

  const [updatedGaji, setUpdatedGaji] = useState({
    bayar_emak: '',
    kasbon: '',
    persentase: '',
  });

  const [filters, setFilters] = useState({
    nama: '',
    bulan: '',
    tahun: '',
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totals, setTotals] = useState({
    koin: 0,
    unsold: 0,
    sales_rate: 0,
    kasbon: 0,
    bayar_emak: 0,
    total_gaji: 0,
  });

  const fetchGajiData = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(`${BACKEND_URL}/api/datagaji`, {
        params: { ...filters, page, limit },
      });

      setGajiList(response.data.data);
      setTotal(response.data.total);
      setTotals(response.data.totals);
    } catch (err) {
      console.error('Gagal mengambil data gaji:', err);
      setError('Gagal mengambil data gaji.');
    }
  };

  const fetchKaryawanData = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(`${BACKEND_URL}/api/getnama`);
      setKaryawanList(response.data);
    } catch (err) {
      console.error('Gagal mengambil data karyawan:', err);
      setError('Gagal mengambil data karyawan.');
    }
  };

  useEffect(() => {
    fetchGajiData();
    fetchKaryawanData();
  }, [filters, page, limit]);

  const handleAddGajiChange = (e) => {
    const { name, value } = e.target;
    setNewGaji((prev) => ({ ...prev, [name]: value }));
  };

  const validateNewGaji = () => {
    const { nama, koin, rate, tanggal } = newGaji;
    if (!nama || !koin || !rate || !tanggal) {
      setError('Semua field wajib diisi.');
      return false;
    }
    setError('');
    return true;
  };

  const handleAddGaji = async () => {
    if (!validateNewGaji()) return;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/addgaji`,
        newGaji
      );

      showNotification('Data gaji berhasil ditambahkan!', 'success');
      setShowAddModal(false);
      setNewGaji({ nama: '', koin: '', unsold: '', rate: '', tanggal: '' });
      fetchGajiData();
    } catch (err) {
      console.error('Gagal menambah data gaji:', err);
      showNotification('Gagal menambah data gaji. Cek data Anda.', 'error');
    }
  };

  const handleUpdateGajiClick = (gaji) => {
    setSelectedGaji(gaji);
    setUpdatedGaji({
      bayar_emak: '',
      kasbon: '',
      persentase: '',
    });
    setShowUpdateModal(true);
  };

  const validateUpdatedGaji = () => {
    const { bayar_emak, kasbon, persentase } = updatedGaji;
    if (!bayar_emak || !kasbon || !persentase) {
 setError('Semua field wajib diisi.');
      return false;
    }
    if (persentase <= 0 || persentase > 100) {
      setError('Persentase harus antara 1 dan 100');
      return false;
    }
    setError('');
    return true;
  };

  const handleUpdateGaji = async () => {
    if (!validateUpdatedGaji()) return;

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/updategaji/${selectedGaji.id_gaji}`,
        updatedGaji
      );

      showNotification('Data gaji berhasil diperbarui!', 'success');
      setShowUpdateModal(false);
      fetchGajiData();
    } catch (err) {
      console.error('Gagal mengupdate data gaji:', err);
      showNotification('Gagal mengupdate data gaji. Cek data Anda.', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotif({ message, type, show: true });
    setTimeout(() => {
      setNotif((prev) => ({ ...prev, show: false }));
    }, 2000);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [name]: value };
      return updatedFilters;
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset to the first page when limit changes
  };

  return (
    <div className="data-container">
      <h2>Data Gaji</h2>

      {/* Form Filter */}
      <div className="filter-container">
        <div className="filter-left">
          <select
            name="bulan"
            value={filters.bulan}
            onChange={handleFilterChange}
            className="filter-input kecil"
          >
            <option value="">Pilih Bulan</option>
            {[
              'Januari',
              'Februari',
              'Maret',
              'April',
              'Mei',
              'Juni',
              'Juli',
              'Agustus',
              'September',
              'Oktober',
              'November',
              'Desember',
            ].map((month, index) => (
              <option key={index + 1} value={index + 1}>
                {month}
              </option>
            ))}
          </select>

          <select
            name="tahun"
            value={filters.tahun}
            onChange={handleFilterChange}
            className="filter-input kecil"
          >
            <option value="">Pilih Tahun</option>
            {[2023, 2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-right">
          <div className="filter-actions">
            <input
              type="text"
              name="nama"
              placeholder="Cari Nama"
              value={filters.nama}
              onChange={handleFilterChange}
              className="filter-input kecil"
            />
            <button className="btn-add" onClick={() => setShowAddModal(true)}>
              Tambah Gaji
            </button>
          </div>
        </div>
      </div>

      {/* Total Display */}

<div className="total-display" style={{ marginLeft: '10px', marginTop: '20px', marginBottom: '20px',textAlign: 'left' }}>
  <h4 style={{ marginBottom: '10px' }}>Total</h4>
  <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '15px', flexWrap: 'wrap' }}>
    <p style={{ margin: '0', fontSize: '16px' }}>Koin: {totals.koin}</p>
    <p style={{ margin: '0', fontSize: '16px' }}>Unsold: {totals.unsold}</p>
    <p style={{ margin: '0', fontSize: '16px' }}>Sales Rate: {totals.sales_rate}</p>
    <p style={{ margin: '0', fontSize: '16px' }}>Kasbon: {totals.kasbon}</p>
    <p style={{ margin: '0', fontSize: '16px' }}>Bayar Emak: {totals.bayar_emak}</p>
    <p style={{ margin: '0', fontSize: '16px' }}>Total Gaji: {totals.total_gaji}</p>
  </div>
</div>

      {/* Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Karyawan</th>
            <th>Koin</th>
            <th>Unsold</th>
            <th>Rate</th>
            <th>Sales Rate</th>
            <th>Sales Bersih</th>
            <th>Kasbon</th>
            <th> Bayar Emak</th>
            <th>Persentase</th>
            <th>Tanggal</th>
            <th>Total Gaji</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {gajiList.length > 0 ? (
            gajiList.map((gaji, index) => (
              <tr key={gaji.id_gaji || index}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td>{gaji.karyawan_nama}</td>
                <td>{gaji.koin}</td>
                <td>{gaji.unsold}</td>
                <td>{gaji.rate}</td>
                <td>{gaji.sales_rate}</td>
                <td>{gaji.sales_bersih}</td>
                <td>{gaji.kasbon}</td>
                <td>{gaji.bayar_emak}</td>
                <td>{gaji.persentase}%</td>
                <td>{gaji.tanggal}</td>
                <td>{gaji.total_gaji}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleUpdateGajiClick(gaji)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="13">Tidak ada data gaji ditemukan</td>
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

      {/* Modal Update */}
      {showUpdateModal && (
        <div className="modal" id="updateGajiModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Gaji</h5>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Bayar Emak</label>
                  <input
                    type="text"
                    name="bayar_emak"
                    value={updatedGaji.bayar_emak}
                    onChange={(e) => setUpdatedGaji({ ...updatedGaji, bayar_emak: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Kasbon</label>
                  <input
                    type="text"
                    name="kasbon"
                    value={updatedGaji.kasbon}
                    onChange={(e) => setUpdatedGaji({ ...updatedGaji, kasbon: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Persentase</label>
                  <input
                    type="text"
                    name="persentase"
                    value={updatedGaji.persentase}
                    onChange={(e) => setUpdatedGaji({ ...updatedGaji, persentase: e.target.value })}
                  />
                </div>
                {error && <p className="error-text">{error}</p>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleUpdateGaji}>
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
        <div className="modal" id="addGajiModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tambah Gaji</h5>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Karyawan</label>
                  <select
                    name="nama"
                    value={newGaji.nama}
                    onChange={handleAddGajiChange}
                  >
                    <option value="">Pilih Karyawan</option>
                    {karyawanList.map((karyawan) => (
                      <option key={karyawan.id} value={karyawan.nama}>
                        {karyawan.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Koin</label>
                  <input
                    type="text"
                    name="koin"
                    value={newGaji.koin}
                    onChange={handleAddGajiChange}
                  />
                </div>
                <div className="form-group">
                  <label>Unsold</label>
                  <input
                    type="text"
                    name="unsold"
                    value={newGaji.unsold}
                    onChange={handleAddGajiChange}
                  />
                </div>
                <div className="form-group">
                  <label>Rate</label>
                  <input
                    type="text"
                    name="rate"
                    value={newGaji.rate}
                    onChange={handleAddGajiChange}
                  />
                </div>
                <div className="form-group">
                  <label>Tanggal</label>
                  <input
                    type="date"
                    name="tanggal"
                    value={newGaji.tanggal}
                    onChange={handleAddGajiChange}
                  />
                </div>
                {error && <p className="error-text">{error}</p>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleAddGaji}>
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

export default DataGaji;