import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css';

const HitungGaji = () => {
  const [karyawanList, setKaryawanList] = useState([]);
  const [hargaRataRata, setHargaRataRata] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchKaryawanData();
  }, []);

  const fetchKaryawanData = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

      // Melakukan request GET untuk mengambil data gaji
      const response = await axios.get(`${BACKEND_URL}/api/transaksi/gaji`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Sesuaikan jika token digunakan
        },
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        setKaryawanList(response.data.data);
      } else {
        setKaryawanList([]);
        setError('Data tidak ditemukan.');
      }
    } catch (err) {
      console.error('Gagal mengambil data karyawan:', err);
      setError('Gagal mengambil data karyawan.');
    } finally {
      setLoading(false);
    }
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

  const calculateTotalGaji = (karyawan) => {
    const gajiTnl = (karyawan.tnl_koin || 0) * hargaRataRata * 0.5;
    const gajiLa = (karyawan.la_koin || 0) * hargaRataRata * 0.5;
    return gajiTnl + gajiLa;
  };

  if (loading) return <p className="loading-text">Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="data-container">
      <h2>Hitung Gaji Karyawan</h2>

      {/* Input Harga Rata-rata */}
      <div className="filter-container">
        <input
          type="number"
          name="hargaRataRata"
          placeholder="Masukkan harga rata-rata koin"
          value={hargaRataRata}
          onChange={handleHargaChange}
          className="filter-input"
        />
        <button className="btn-action" onClick={() => {}}>
          Hitung Gaji
        </button>
      </div>

      {/* Tabel Data */}
      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Karyawan</th>
            <th>Koin TNL</th>
            <th>Koin LA</th>
            <th>Gaji Koin TNL</th>
            <th>Gaji Koin LA</th>
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
              <td colSpan="6">Tidak ada data karyawan tersedia</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataGaji;