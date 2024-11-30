import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/Data.css'; // Pastikan file CSS ini tersedia.

const HitungGaji = () => {
  const [karyawanList, setKaryawanList] = useState([]);
  const [hargaRataRata, setHargaRataRata] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchKaryawanData();
  }, []);

  const fetchKaryawanData = async () => {
    setLoading(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

      // Melakukan request GET untuk mengambil data gaji
      const response = await axios.get(`${BACKEND_URL}/transaksi/gaji`, {
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

  const handleHargaChange = (e) => {
    setHargaRataRata(e.target.value);
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
            <th>Nama Karyawan</th>
            <th>Koin TNL</th>
            <th>Koin LA</th>
            <th>Gaji Koin TNL</th>
            <th>Gaji Koin LA</th>
            <th>Total Gaji</th>
          </tr>
        </thead>
        <tbody>
          {karyawanList && karyawanList.length > 0 ? (
            karyawanList.map((karyawan, index) => (
              <tr key={karyawan.nama || index}>
                <td>{karyawan.nama}</td>
                <td>{karyawan.tnl_koin || 0}</td>
                <td>{karyawan.la_koin || 0}</td>
                <td>
                  {hargaRataRata
                    ? ((karyawan.tnl_koin || 0) * hargaRataRata * 0.5).toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      })
                    : '-'}
                </td>
                <td>
                  {hargaRataRata
                    ? ((karyawan.la_koin || 0) * hargaRataRata * 0.5).toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      })
                    : '-'}
 </td>
                <td>
                  {hargaRataRata
                    ? calculateTotalGaji(karyawan).toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      })
                    : '-'}
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

export default HitungGaji;