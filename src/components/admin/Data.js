import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css';

const Data = () => {
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [jumlahDijual, setJumlahDijual] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [server, setServer] = useState('');
  const [demand, setDemand] = useState('');
  const [rate, setRate] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notifikasi, setNotifikasi] = useState('');
  const [notifikasiStatus, setNotifikasiStatus] = useState('');
  const [karyawanList, setKaryawanList] = useState([]);

  const [filters, setFilters] = useState({
    nama: '',
    jenis: '',
    tanggal: '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchKaryawanList = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
        const response = await axios.get(`${BACKEND_URL}/api/getnama`);
        setKaryawanList(response.data);
      } catch (err) {
        console.error('Gagal mengambil daftar karyawan:', err);
      }
    };

    if (showModal) {
      fetchKaryawanList();
    }
  }, [showModal]);

  useEffect(() => {
    const fetchFilteredTransaksi = async () => {
      setLoading(true);
      setError('');
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
        const response = await axios.get(`${BACKEND_URL}/api/transaksi/filter`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: { ...filters, page, limit },
        });
        setTransaksiList(response.data.data);
        setTotal(response.data.total);
      } catch (err) {
        console.error('Gagal mengambil data transaksi:', err);
        setError('Gagal mengambil data transaksi.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredTransaksi();
  }, [filters, page, limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    setPage(1);
  };

  const handleDetailClick = (transaksi) => {
    setSelectedTransaksi(transaksi);
    setShowDetailModal(true);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleButtonClick = (transaksi) => {
    setSelectedTransaksi(transaksi);
    setJumlahDijual('');
    setTanggal('');
    setServer('');
    setDemand('');
    setRate('');
    setShowModal(true);
  };

  const handleJualKoin = async () => {
    if (!selectedTransaksi) {
      tampilkanNotifikasi('Transaksi yang dipilih tidak ditemukan!', 'error');
      return;
    }

    const idKoin = selectedTransaksi.id_koin;

    if (!idKoin) {
      tampilkanNotifikasi('ID Koin tidak ditemukan!', 'error');
      return;
    }

    if (!jumlahDijual || jumlahDijual <= 0) {
      tampilkanNotifikasi('Jumlah dijual harus lebih dari 0!', 'error');
      return;
    }

    if (!tanggal || !server || !demand || !rate) {
      tampilkanNotifikasi('Semua data untuk penjualan harus diisi!', 'error');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/sellkoins/${idKoin}`,
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
        tampilkanNotifikasi('Koin berhasil dijual!', 'success');
        setTransaksiList((prevTransaksiList) =>
          prevTransaksiList.map((transaksi) =>
            transaksi.id_transaksi === selectedTransaksi.id_transaksi
              ? {
                  ...transaksi,
                  jumlah_dijual: transaksi.jumlah_dijual + Number(jumlahDijual),
                  jumlah_sisa: transaksi.jumlah_sisa - Number(jumlahDijual),
                }
              : transaksi
          )
        );
        setShowModal(false);
      }
    } catch (err) {
      console.error('Gagal menjual koin:', err.response ? err.response.data : err);
      tampilkanNotifikasi(
        `Gagal menjual koin: ${err.response?.data?.error || 'Coba lagi nanti.'}`,
        'error'
      );
    }
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
    <div className="data-container">
      <h2>Riwayat Transaksi</h2>

      {notifikasi && (
        <div className={`notifikasi ${notifikasiStatus}`}>
          {notifikasi}
        </div>
      )}

      <div className="filter-container">
        <div className="filter-left">
          <input
            type="date"
            name="tanggal"
            value={filters.tanggal}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <select
            name="jenis"
            value={filters.jenis}
            onChange={handleFilterChange}
            className="filter-input"
          >
            <option value="">Semua Jenis</option>
            <option value="LA">LA</option>
            <option value="TNL">TNL</option>
          </select>
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

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Karyawan</th>
            <th>Jenis Game</th>
            <th>Jumlah Awal</th>
            <th>Jumlah Dijual</th>
            <th>Jumlah Sisa</th>
            <th>Shift</th>
            <th>Keterangan</th>
            <th>Waktu</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {transaksiList.length > 0 ? (
            transaksiList.map((transaksi, index) => (
              <tr key={transaksi.id_transaksi}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td className="nama">{transaksi.nama}</td>
                <td>
                  <span className={`jenis-game ${transaksi.jenis.toLowerCase()} jenis`}>
                    {transaksi.jenis}
                  </span>
                </td>
                <td className="koin">{transaksi.jumlah_awal}</td>
                <td className="koin">{transaksi.jumlah_dijual}</td>
                <td className="koin">{transaksi.jumlah_sisa}</td>
                <td>
                  <span className={`shift ${transaksi.shift.toLowerCase()} shift`}>
                    {transaksi.shift}
                  </span>
                </td>
                <td>
                  <span
                    className={`keterangan ${
                      transaksi.keterangan.toLowerCase() === 'masuk' ? 'masuk' : 'pulang'
                    }`}
                  >
                    {transaksi.keterangan}
                  </span>
                </td>
                <td>{new Date(transaksi.waktu).toLocaleString()}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleDetailClick(transaksi)}
                  >
                    Detail
                  </button>
                  <button
                    className="btn-action"
                    onClick={() => handleButtonClick(transaksi)}
                    style={{ marginLeft: '5px' }}
                  >
                    Jual Koin
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">Tidak ada transaksi tersedia</td>
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

      {showModal && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Jual Koin</h5>
              </div>
              <div className="modal-body">
                <div className="modal-row">
                  <p><strong>Akun Steam:</strong> {selectedTransaksi?.akun_steam}</p>
                  <p><strong>Jumlah Awal:</strong> {selectedTransaksi?.jumlah_awal}</p>
                </div>
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
                      type="text"
                      className="form-control"
                      id="rate"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                < button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
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
    </div>
  );
};

export default Data;