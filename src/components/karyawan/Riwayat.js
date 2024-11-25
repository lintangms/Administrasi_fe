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
  const [showDetailModal, setShowDetailModal] = useState(false); // State for detail modal
  const [notifikasi, setNotifikasi] = useState('');
  const [notifikasiStatus, setNotifikasiStatus] = useState('');

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
        const response = await axios.get(`${BACKEND_URL}/transaksi/handleget/${idKaryawan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Response Data:', response.data.data);
        setTransaksiList(response.data.data);
      } catch (err) {
        console.error('Error saat mengambil data transaksi:', err);
        setError('Gagal mengambil data transaksi');
      } finally {
        setLoading(false);
      }
    };
    

    fetchTransaksi();
  }, [idKaryawan, token]);

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

      {loading && <p className="loading">Sedang memuat data...</p>}
      {error && <p className="error">{error}</p>}

      {notifikasi && (
        <div className={`notifikasi ${notifikasiStatus}`}>
          {notifikasi}
        </div>
      )}

      {!loading && !error && (
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
                  <td>{index + 1}</td>
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
                    <div style={{ whiteSpace: 'nowrap' }}>
                      <button
                        className="btn-action"
                        onClick={() => handleButtonClick(transaksi)}
                        style={{ display: 'inline-block', marginRight: '5px' }}
                      >
                        Jual Koin
                      </button>
                      <button
                        className="btn-action"
                        onClick={() => handleDetailClick(transaksi)}
                        style={{ display: 'inline-block' }}
                      >
                        Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center' }}>
                  Tidak ada transaksi yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal Jual Koin */}
      {showModal && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Jual Koin</h5>
              </div>
              <div className="modal-body">
                <p><strong>Akun Steam:</strong> {selectedTransaksi?.akun_steam}</p>
                <p><strong>Jumlah Awal:</strong> {selectedTransaksi?.jumlah_awal}</p>
                <div className="mb-3">
                  <label htmlFor="jumlahDijual" className="form-label">
                    Jumlah Koin yang Dijual
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="jumlahDijual"
                    value={jumlahDijual}
                    onChange={(e) => setJumlahDijual(e.target.value)}
                    min="1"
                    max={selectedTransaksi?.jumlah_sisa || 0}
                  />
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
