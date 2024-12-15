import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Riwayat.css';

const Riwayat = () => {
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [jumlahDijual, setJumlahDijual] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notifikasi, setNotifikasi] = useState('');
  const [notifikasiStatus, setNotifikasiStatus] = useState('');

  // State untuk filter dan pagination
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

    const fetchTransaksi = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/transaksi/handleget/${idKaryawan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { ...filters, page, limit },
        });
        
        // Sort the transactions by id_transaksi in descending order
        const sortedTransaksi = response.data.data.sort((a, b) => b.id_transaksi - a.id_transaksi);
        
        setTransaksiList(sortedTransaksi);
        setTotal(response.data.total);
      } catch (err) {
        console.error('Error saat mengambil data transaksi:', err);
        setError('Gagal mengambil data transaksi');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaksi();
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
    setPage(1); // Reset ke halaman pertama saat limit berubah
  };

  const handleButtonClick = (transaksi) => {
    setSelectedTransaksi(transaksi);
    setJumlahDijual('');
    setShowModal(true);
  };

  const handleDetailClick = (transaksi) => {
    setSelectedTransaksi(transaksi);
    setShowDetailModal(true);
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

    try {
      const response = await axios.put(
        `http://localhost:5000/transaksi/sellkoin/${idKoin}`,
        { jumlah_dijual: jumlahDijual },
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
    }, 3000); // Notifikasi akan hilang otomatis setelah 3 detik
  };

  return (
    <div className="riwayat-container">
      <h2>Riwayat Transaksi</h2>



      {notifikasi && (
        <div className={`notifikasi ${notifikasiStatus}`}>
          {notifikasi}
        </div>
      )}

      { (
        <table className="riwayat-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Akun Steam</th>
              <th style={{ display: 'none' }}>Akun Gmail</th> {/* Hide this column */}
              <th>Jenis Game</th>
              <th>Jumlah Awal</th>
              <th>Jumlah Dijual</th>
              <th>Jumlah Sisa</th>
              <th>Shift</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transaksiList.length > 0 ? (
              transaksiList.map((transaksi, index) => (
                <tr key={transaksi.id_transaksi}>
                  <td>{(page - 1) * limit + index + 1}</td>
                  <td>{transaksi.akun_steam}</td>
                  <td style={{ display: 'none' }}>{transaksi.akun_gmail}</td>
                  <td>
                    <span className={`jenis-game ${transaksi.jenis.toLowerCase()}`}>
                      {transaksi.jenis}
                    </span>
                  </td>
                  <td className="jumlah-awal">{transaksi.jumlah_awal}</td>
                  <td className="jumlah-dijual">{transaksi.jumlah_dijual}</td>
                  <td className="jumlah-sisa">{transaksi.jumlah_sisa}</td>
                  <td>
                    <span className={`shift ${transaksi.shift.toLowerCase()}`}>
                      {transaksi.shift}
                    </span>
                  </td>
                  <td>
                    <span className={`keterangan ${transaksi.keterangan.toLowerCase()}`}>
                      {transaksi.keterangan}
                    </span>
                  </td>
                  <td>
                 
                    <button
                      className="btn-action"
                      onClick={() => handleDetailClick(transaksi)}
                    >
                      Detail
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
          {/* Tombol Previous */}
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

          {/* Tombol Next */}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === Math.ceil(total / limit)}
          >
            &gt;
          </button>
        </div>
      </div>


      {/* Modal Detail */}
      {showDetailModal && selectedTransaksi && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Transaksi</h5>
              </div>
              <div className="modal-body">
                <p><strong>Akun Steam:</strong> {selectedTransaksi?.akun_steam}</p>
                <p><strong>Jenis Game:</strong> {selectedTransaksi?.jenis}</p>
                <p><strong>Jumlah Awal:</strong> {selectedTransaksi?.jumlah_awal}</p>
                <p><strong>Jumlah Dijual:</strong> {selectedTransaksi?.jumlah_dijual}</p>
                <p><strong>Jumlah Sisa:</strong> {selectedTransaksi?.jumlah_sisa}</p>
                <p><strong>Keterangan:</strong> {selectedTransaksi?.keterangan}</p>
                <p><strong>Shift:</strong> {selectedTransaksi?.shift}</p>
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

export default Riwayat;