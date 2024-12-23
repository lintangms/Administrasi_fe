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
  const [showModal, setShowModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [jumlahDijual, setJumlahDijual] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [server, setServer] = useState('');
  const [demand, setDemand] = useState('');
  const [rate, setRate] = useState('');
  const [newRate, setNewRate] = useState(''); 
  const [originalData, setOriginalData] = useState([]); // Data asli
  const [filteredData, setFilteredData] = useState([]);

  // State untuk filter dan pagination
  const [filters, setFilters] = useState({
    id_karyawan: '',
    bulan: '',
    tahun: '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totals, setTotals] = useState({ total_jumlah_sisa: 0, total_rupiah: 0 });

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
          setTotal(response.data.pagination.total); // Mengambil total data untuk pagination
          setTotals(response.data.totals); // Mengambil total jumlah sisa dan total rupiah
        } else {
          setUnsoldList([]);
        }
      } catch (err) {
        console.error('Gagal mengambil data unsold:', err);
        setError('Gagal mengambil data unsold.');
        setTimeout(() => setError(''), 5000); // Hapus error setelah 5 detik
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredUnsold();
  }, [filters, page, limit]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [name]: value };
  
      // Lakukan filtering langsung setelah perubahan
      const filteredData = originalData.filter((item) => {
        const itemDate = new Date(item.tanggal); // Asumsikan `tanggal` adalah format `YYYY-MM-DD`
        const filterBulan = updatedFilters.bulan ? itemDate.getMonth() + 1 === parseInt(updatedFilters.bulan) : true;
        const filterTahun = updatedFilters.tahun ? itemDate.getFullYear() === parseInt(updatedFilters.tahun) : true;
  
        return filterBulan && filterTahun;
      });
  
      setFilteredData(filteredData);
  
      return updatedFilters;
    });
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

  const handleButtonClick = (unsold) => {
    setSelectedUnsold(unsold);
    setJumlahDijual('');
    setTanggal('');
    setServer('');
    setDemand('');
    setRate('');
    setShowModal(true);
  };

  const handleRateButtonClick = (unsold) => {
    setSelectedUnsold(unsold);
    setNewRate('');
    setShowRateModal(true);
  };

  const handleJualKoin = async () => {
    if (!selectedUnsold) {
      setError('Transaksi yang dipilih tidak ditemukan!');
      setTimeout(() => setError(''), 5000); // Hapus error setelah 5 detik
      return;
    }

    const idUnsold = selectedUnsold.id_unsold; // Pastikan id_unsold ada di data unsold

    if (!idUnsold) {
      setError('ID Koin tidak ditemukan!');
      setTimeout(() => setError(''), 5000); // Hapus error setelah 5 detik
      return;
    }

    if (!jumlahDijual || jumlahDijual <= 0) {
      setError('Jumlah dijual harus lebih dari 0!');
      setTimeout(() => setError(''), 5000); // Hapus error setelah 5 detik
      return;
    }

    if (!tanggal || !server || !demand || !rate) {
      setError('Semua data untuk penjualan harus diisi!');
      setTimeout(() => setError(''), 5000); // Hapus error setelah 5 detik
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/sellunsold/${idUnsold}`,
        { 
          jumlah_dijual: Number(jumlahDijual), // Pastikan ini adalah angka
          tanggal,
          server,
          demand,
          rate: Number(rate) // Pastikan ini adalah angka
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage('Koin berhasil dijual!');
        setUnsoldList((prevUnsoldList) =>
          prevUnsoldList.map((unsold) =>
            unsold.id_unsold === selectedUnsold.id_unsold
              ? {
                  ...unsold,
                  jumlah_dijual: unsold.jumlah_dijual + Number(jumlahDijual),
                  jumlah_sisa: unsold.jumlah_sisa - Number(jumlahDijual),
                }
              : unsold
          )
        );
        setShowModal(false);
      }
    } catch (err) {
      console.error('Gagal menjual koin:', err.response ? err.response.data : err);
      setError(`Gagal menjual koin: ${err.response?.data?.error || 'Coba lagi nanti.'}`);
      setTimeout(() => setError(''), 5000); // Hapus error setelah 5 detik
    } finally {
      // Menghilangkan notifikasi setelah 3 detik
      setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 3000);
    }
  };

  const handleRateSubmit = async () => {
    if (!selectedUnsold) {
      setError('Transaksi yang dipilih tidak ditemukan!');
      setTimeout(() => setError(''), 5000); // Hapus error setelah 5 detik
      return;
    }

    const idUnsold = selectedUnsold.id_unsold; // Pastikan id_unsold ada di data unsold

    if (!idUnsold) {
      setError('ID Koin tidak ditemukan!');
      setTimeout(() => setError(''), 5000); // Hapus error setelah 5 detik
      return;
    }

    if (!newRate) {
      setError('Rate tidak boleh kosong!');
      setTimeout(() => setError(''), 5000); // Hapus error setelah 5 detik
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/updateunsold/${idUnsold}`,
        { rate: Number(newRate) }, // Pastikan ini adalah angka
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage('Rate berhasil diperbarui!');
        setUnsoldList((prevUnsoldList) =>
          prevUnsoldList.map((unsold) =>
            unsold.id_unsold === selectedUnsold.id_unsold
              ? { ...unsold, rate: Number(newRate) }
              : unsold
          )
        );
        setShowRateModal(false);
      }
    } catch (err) {
      console.error('Gagal memperbarui rate:', err.response ? err.response.data : err);
      setError(`Gagal memperbarui rate: ${err.response?.data?.error || 'Coba lagi nanti.'}`);
      setTimeout(() => setError(''), 5000); // Hapus error setelah 5 detik
    } finally {
      // Menghilangkan notifikasi setelah 3 detik
      setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 3000);
    }
  };

  return (
    <div className="data-container">
      <h2>Data Unsold</h2>

      {/* Notification Messages */}
      {successMessage && <div className="notification success">{successMessage}</div>}
      {error && <div className="notification error">{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
  {/* Filter Section */}
  <div className="filter-container" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <select
      name="bulan"
      value={filters.bulan}
      onChange={handleFilterChange}
      className="filter-input"
      style={{ padding: '5px' }}
    >
      <option value="">Pilih Bulan</option>
      {[
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
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
      className="filter-input"
      style={{ padding: '5px' }}
    >
      <option value="">Pilih Tahun</option>
      {[2023, 2024, 2025, 2026].map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  </div>

  {/* Total Data and Filter Button */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div className="total-data-container">
      <h4 style={{ margin: 0 }}>Total Jumlah Sisa: {totals.total_jumlah_sisa}</h4>
      <h4 style={{ margin: 0 }}>Total Rupiah: {totals.total_rupiah}</h4>
    </div>
   
  </div>
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
            <th>Rate</th>
            <th>RP</th>
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
                <td>{unsold.rate}</td>
                <td>{unsold.total_harga}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleButtonClick(unsold)}
                    style={{ marginLeft: '5px' }}
                  >
                    Jual Koin
                  </button>
                  <button
                    className="btn-action"
                    onClick={() => handleRateButtonClick(unsold)}
                    style={{ marginLeft: '5px' }}
                  >
                    Rate
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11">Tidak ada data unsold tersedia</td>
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
                      key={ pageNumber}
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
            </>
          )}
        </div>
      </div>

      {/* Modal untuk Jual Koin */}
      {showModal && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Jual Koin</h5>
              </div>
              <div className="modal-body">
                <div className="modal-row">
                  <div className="modal-input">
                    <label htmlFor="jumlahDijual">Jumlah Dijual</label>
                    <input
                      type="number"
                      className="form-control"
                      id="jumlahDijual"
                      value={jumlahDijual}
                      onChange={(e) => setJumlahDijual(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-row">
                  <div className="modal-input">
                    <label htmlFor="tanggal">Tanggal</label>
                    <input
                      type="date"
                      className="form-control"
                      id="tanggal"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                    />
                  </div>
                  <div className="modal-input">
                    <label htmlFor="server">Server</label>
                    <input
                      type="text"
                      className="form-control"
                      id="server"
                      value={server}
                      onChange={(e) => setServer(e.target.value)}
                    />
                  </div>
                  <div className="modal-input">
                    <label htmlFor="demand">Demand</label>
                    <input
                      type="text"
                      className="form-control"
                      id="demand"
                      value={demand}
                      onChange={(e) => setDemand(e.target.value)}
                    />
                  </div>
                  <div className="modal-input">
                    <label htmlFor="rate">Rate</label>
                    <input
                      type="number"
                      className="form-control"
                      id="rate"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Tutup
                </button>
                <button type="button" className="btn btn-primary" onClick={handleJualKoin}>
                  Jual
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal untuk Update Rate */}
      {showRateModal && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Rate</h5>
                <button type="button" className="btn-close" onClick={() => setShowRateModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="modal-input">
                  <label htmlFor="newRate">Rate Baru</label>
                  <input
                    type="number"
                    className="form-control"
                    id="newRate"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRateModal(false)}>
                  Tutup
                </button>
                <button type="button" className="btn btn-primary" onClick={handleRateSubmit}>
                  Update Rate
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