import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css'; // Pastikan file CSS ini sudah ada dan terhubung

const DataPenjualan = () => {
  const [penjualanList, setPenjualanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPenjualan, setSelectedPenjualan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const formatNumber = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };
  

  // State untuk filter dan pagination
  const [filters, setFilters] = useState({
    id_karyawan: '',
    type: '', // 'koin' atau 'unsold'
    bulan: '',
    tahun: '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalRp, setTotalRp] = useState(0);
  const [totalHarga, setTotalHarga] = useState(0); // Total RP untuk koin
  const [rataRate, setRataRate] = useState(0); // Rata-rata rate
  const [totalJual, setTotalJual] = useState(0);
  const [totalJumlah, setTotalJumlah] = useState(0);

  useEffect(() => {
    const fetchFilteredPenjualan = async () => {
      setLoading(true);
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
        let endpoint = '';

        // Tentukan endpoint berdasarkan filter type
        if (filters.type === 'unsold') {
          endpoint = '/api/getsellunsold';
        } else if (filters.type === 'koin') {
          endpoint = '/api/getpenjualan';
        } else {
          return; // Jika type kosong, tidak perlu request
        }

        const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: { ...filters, page, limit },
        });

        // Log response data untuk debugging
        console.log('Response Data:', response.data);

        // Cek apakah response.data.data adalah array dan lakukan filter
        if (Array.isArray(response.data.data)) {
          // Filter data agar hanya menampilkan id_koin atau id_unsold ≠ 0
          const filteredData = response.data.data.filter((item) =>
            filters.type === 'koin' ? item.id_koin !== 0 : item.id_unsold !== 0
          );

          setPenjualanList(filteredData);
          setTotal(response.data.total); // Total data berdasarkan response.total
          setTotalRp(response.data.total_rp || 0);
          setTotalHarga(response.data.total_harga || 0); // Total RP (untuk koin atau unsold)
          setRataRate(response.data.rata_rate || 0); // Rata-rata rate
          setTotalJual(response.data.total_dijual || 0);
          setTotalJumlah(response.data.total_jumlah_dijual || 0);
        } else {
          // Jika data bukan array, tampilkan error
          console.error('Data tidak valid:', response.data);
          setError('Data tidak valid diterima dari server.');
        }
      } catch (err) {
        console.error('Gagal mengambil data penjualan:', err);
        setError('Gagal mengambil data penjualan.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredPenjualan();
  }, [filters, page, limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleDetailClick = (penjualan) => {
    setSelectedPenjualan(penjualan);
    setShowDetailModal(true);
  };

  const handleTypeChange = (type) => {
    setFilters({ ...filters, type });
    setPage(1);
  };

  const handlePageChange = (newPage) => setPage(newPage);

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  return (
    <div className="data-container">
      <h2>Data Penjualan</h2>

      {/* Error Notification */}
      {error && <div className="notification error">{error}</div>}

      {/* Tombol Koin dan Unsold */}
      <div className="button-group" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button
          className={`btn-filter ${filters.type === 'koin' ? 'active' : ''}`}
          onClick={() => handleTypeChange('koin')}
        >
          Koin
        </button>
        <button
          className={`btn-filter ${filters.type === 'unsold' ? 'active' : ''}`}
          onClick={() => handleTypeChange('unsold')}
        >
          Unsold
        </button>
      </div>

      {/* Filter Bulan dan Tahun */}
      <div
  className="filter-container"
  style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '15px',
    justifyContent: 'flex-start', // Menyusun filter ke kiri
  }}
>
  <select
    name="bulan"
    value={filters.bulan}
    onChange={handleFilterChange}
    className="filter-input"
    style={{ padding: '5px', width: '120px' }}
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
    className="filter-input"
    style={{ padding: '5px', width: '100px' }}
  >
    <option value="">Pilih Tahun</option>
    {[2023, 2024, 2025, 2026].map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>

  {/* Filter by Nama */}
  <input
    type="text"
    name="nama"
    value={filters.nama}
    onChange={handleFilterChange}
    className="filter-input"
    placeholder="Filter by Nama"
    style={{ padding: '5px', width: '200px' }}
  />
</div>


      <div className="stats-container" style={{ marginBottom: '20px' }}>
  {filters.type === 'koin' && (
    <>
      <p>Total RP: {formatNumber(totalRp)}</p>
      <p>Rata-rata Rate: {formatNumber(rataRate)}</p>
      <p>Total Koin Dijual: {formatNumber(totalJual)}</p>
    </>
  )}
  {filters.type === 'unsold' && (
    <>
      <p>Total Harga: {formatNumber(totalHarga)}</p>
      <p>Rata-rata Rate: {formatNumber(rataRate)}</p>
      <p>Total Koin Dijual: {formatNumber(totalJumlah)}</p>
    </>
  )}
</div>



  
    {/* Table Data */}
    <table className="data-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Karyawan</th>
          <th>Server</th>
          <th>Demand</th>
          <th>Rate</th>
          <th>Tanggal</th>
          <th>Jumlah dijual</th>
          <th>Harga</th>
          <th>Aksi</th>
        </tr>
      </thead>
  
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9">Loading...</td>
            </tr>
          ) : penjualanList.length > 0 ? (
            penjualanList.map((penjualan, index) => (
              <tr key={index}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td>{penjualan.karyawan_nama}</td>
                <td>{penjualan.server}</td>
                <td>{penjualan.demand}</td>
                <td>{penjualan.rate}</td>
                <td>{penjualan.tanggal}</td>
                <td>{penjualan.dijual}</td>
                <td>{penjualan.rp}</td>
                <td>
                  <button className="btn-action" onClick={() => handleDetailClick(penjualan)}>
                    Detail
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">Tidak ada data penjualan tersedia</td>
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
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPenjualan && (
        <div className="modal fade show" style={{ display: 'block' }} id="detailPenjualanModal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Penjualan</h5>
                <button type="button" className="close" onClick={() => setShowDetailModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Nama Karyawan:</strong> {selectedPenjualan.karyawan_nama}</p>
                <p><strong>Server:</strong> {selectedPenjualan.server}</p>
                <p><strong>Demand:</strong> {selectedPenjualan.demand}</p>
                <p><strong>Rate:</strong> {selectedPenjualan.rate}</p>
                <p><strong>Harga:</strong> {selectedPenjualan.rp}</p>
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

export default DataPenjualan;
