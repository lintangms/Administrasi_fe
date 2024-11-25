import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Riwayat.css'; // Pastikan CSS ini ada untuk styling

const RiwayatKasbon = () => {
  const [kasbonList, setKasbonList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedKasbon, setSelectedKasbon] = useState(null);
  const [jumlahCicilan, setJumlahCicilan] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // State untuk modal detail
  const [notifikasi, setNotifikasi] = useState('');
  const [notifikasiStatus, setNotifikasiStatus] = useState('');

  const idKaryawan = localStorage.getItem('id_karyawan');
  const token = localStorage.getItem('token');
  useEffect(() => {
    if (!idKaryawan || !token) {
      setError('ID Karyawan atau Token tidak valid');
      return;
    }
  
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Ambil URL dari .env
  
    const fetchKasbon = async () => {
      setLoading(true);
      try {
        // Mengambil data kasbon berdasarkan id_karyawan
        const response = await axios.get(`${BACKEND_URL}/api/kasbon/${idKaryawan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Kasbon Data:', response.data.data);
        setKasbonList(response.data.data);
      } catch (err) {
        console.error('Error saat mengambil data kasbon:', err);
        setError('Gagal mengambil data kasbon');
      } finally {
        setLoading(false);
      }
    };
  
    fetchKasbon();
  }, [idKaryawan, token]);
  
  // const handleButtonClick = (kasbon) => {
  //   setSelectedKasbon(kasbon);
  //   setJumlahCicilan('');
  //   setShowModal(true);
  // };

  const handleDetailClick = (kasbon) => {
    setSelectedKasbon(kasbon);
    setShowDetailModal(true);
  };

  const handleBayarKasbon = async () => {
    if (!selectedKasbon) {
      tampilkanNotifikasi('Kasbon yang dipilih tidak ditemukan!', 'error');
      return;
    }

    const idKaryawan = selectedKasbon.id_karyawan; // Menggunakan id_karyawan alih-alih id_kasbon

    if (!idKaryawan) {
      tampilkanNotifikasi('ID Karyawan tidak ditemukan!', 'error');
      return;
    }

    if (!jumlahCicilan || jumlahCicilan <= 0) {
      tampilkanNotifikasi('Jumlah cicilan harus lebih dari 0!', 'error');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/kasbon/${idKaryawan}`, // Mengubah endpoint untuk pembaruan
        { jumlah_cicilan: jumlahCicilan },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        tampilkanNotifikasi('Kasbon berhasil dibayar!', 'success');
        setKasbonList((prevKasbonList) =>
          prevKasbonList.map((kasbon) =>
            kasbon.id_karyawan === selectedKasbon.id_karyawan // Menyesuaikan dengan id_karyawan
              ? {
                  ...kasbon,
                  jumlah_cicilan: kasbon.jumlah_cicilan + Number(jumlahCicilan),
                  jumlah_sisa: kasbon.jumlah_sisa - Number(jumlahCicilan),
                }
              : kasbon
          )
        );
        setShowModal(false);
      }
    } catch (err) {
      console.error('Gagal membayar kasbon:', err.response ? err.response.data : err);
      tampilkanNotifikasi(
        `Gagal membayar kasbon: ${err.response?.data?.error || 'Coba lagi nanti.'}`,
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
      <h2>Riwayat Kasbon</h2>

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
              <th>Keperluan</th>
              <th>Nominal</th>
              <th>Status</th>
              <th>Cicilan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
  {kasbonList.length > 0 ? (
    kasbonList.map((kasbon, index) => (
      <tr key={kasbon.id_kasbon}>
        <td>{index + 1}</td>
        <td>{kasbon.keperluan}</td>
        {/* Format nominal menggunakan Intl.NumberFormat */}
        <td>Rp. {new Intl.NumberFormat('id-ID').format(kasbon.nominal)}</td>
        <td>{kasbon.status}</td>
        <td>{kasbon.cicilan} bulan</td>
        <td>
          <div style={{ whiteSpace: 'nowrap' }}>
            <button
              className="btn-action"
              onClick={() => handleDetailClick(kasbon)}
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
      <td colSpan="7" style={{ textAlign: 'center' }}>
        Tidak ada kasbon yang ditemukan.
      </td>
    </tr>
  )}
</tbody>

        </table>
      )}
      {/* Modal Detail */}
      {showDetailModal && selectedKasbon && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Kasbon</h5>
              </div>
              <div className="modal-body">
                <p><strong>Keperluan:</strong> {selectedKasbon?.keperluan}</p>
                <p><strong>Nominal:</strong> Rp.{selectedKasbon?.nominal}</p>
                <p><strong>Status: </strong>{selectedKasbon?.status}</p>
                <p><strong>Cicilan:</strong> {selectedKasbon?.cicilan} bulan</p>
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

export default RiwayatKasbon;
