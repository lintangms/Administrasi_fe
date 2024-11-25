import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/Data.css'; // Pastikan file CSS ini tersedia.

const HitungGaji = () => {
  const [karyawanList, setKaryawanList] = useState([]);
  const [hargaRataRata, setHargaRataRata] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fungsi untuk mengambil data dari API berdasarkan harga rata-rata
  const fetchKaryawanData = async () => {
    if (!hargaRataRata || isNaN(hargaRataRata)) {
      alert('Masukkan harga rata-rata yang valid!');
      return;
    }
  
    setLoading(true);
    try {
      // Mengambil URL dari environment variable
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  
      // Melakukan request GET untuk mengambil data gaji
      const response = await axios.get(`${BACKEND_URL}/transaksi/gaji`, {
        params: { harga_rata_rata: hargaRataRata },
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
      console.error('Error fetching data:', err);
      setError('Gagal mengambil data karyawan.');
    } finally {
      setLoading(false);
    }
  };
  

  // Fungsi untuk menangani perubahan input harga rata-rata
  const handleHargaChange = (e) => {
    setHargaRataRata(e.target.value);
  };

  // Menampilkan loading atau error jika ada
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
        <button className="btn-action" onClick={fetchKaryawanData}>
          Hitung Gaji
        </button>
      </div>

      {/* Tabel Data */}
      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Karyawan</th>
            <th>Jenis Game</th>
            <th>Total Koin</th>
            <th>Gaji</th>
          </tr>
        </thead>
        <tbody>
          {karyawanList && karyawanList.length > 0 ? (
            karyawanList.map((karyawan, index) => (
              <React.Fragment key={karyawan.nama || index}>
                {/* Baris Game TNL */}
                <tr>
                  <td>{index + 1}</td>
                  <td>{karyawan.nama}</td>
                  <td>TNL</td>
                  <td>{karyawan.tnl_koin || 0}</td>
                  <td>
                    {hargaRataRata
                      ? (
                          (karyawan.tnl_koin || 0) * hargaRataRata * 0.5
                        ).toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        })
                      : '-'}
                  </td>
                </tr>
                {/* Baris Game LA */}
                <tr>
                  <td></td>
                  <td></td>
                  <td>LA</td>
                  <td>{karyawan.la_koin || 0}</td>
                  <td>
                    {hargaRataRata
                      ? (
                          (karyawan.la_koin || 0) * hargaRataRata * 0.5
                        ).toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        })
                      : '-'}
                  </td>
                </tr>
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="5">Tidak ada data karyawan tersedia</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HitungGaji;
