import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/Dispensasi.css'; // Pastikan file CSS ini tersedia

const Dispensasi = () => {
  const [keperluan, setKeperluan] = useState('');
  const [hari, setHari] = useState('');
  const [tanggal, setTanggal] = useState(''); // State untuk tanggal
  const [idKaryawan, setIdKaryawan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ message: '', type: '' });

  useEffect(() => {
    const id = localStorage.getItem('id_karyawan') || sessionStorage.getItem('id_karyawan');
    if (id) {
      setIdKaryawan(id);
    } else {
      setNotif({ message: 'ID karyawan tidak ditemukan. Harap login terlebih dahulu.', type: 'error' });
    }
  }, []);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Ambil URL backend dari .env

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validasi field
    if (!keperluan || !hari || !tanggal || !idKaryawan) {
      setNotif({ message: 'Semua field wajib diisi!', type: 'error' });
      setLoading(false);
      return;
    }

    const dispensasiData = {
      keperluan,
      hari,
      tanggal, // Tambahkan tanggal ke payload
    };

    try {
      const response = await axios.post(`${BACKEND_URL}/api/adddispen/${idKaryawan}`, dispensasiData);

      if (response.data.success) {
        setNotif({ message: 'Dispensasi berhasil ditambahkan!', type: 'success' });
        setKeperluan('');
        setHari('');
        setTanggal(''); // Reset tanggal setelah berhasil menambahkan
      } else {
        setNotif({ message: 'Gagal menambahkan dispensasi.', type: 'error' });
      }
    } catch (err) {
      console.error('Error saat menambahkan dispensasi:', err);
      setNotif({ message: 'Terjadi kesalahan saat mengirim data!', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setNotif({ message: '', type: '' });
      }, 2000);
    }
  };

  return (
    <div className="dispensasi-container">
      <div className="image-left"></div>

      <div className="form-center"> {/* Class ini memastikan form berada di tengah */}
        <h2>Form Dispensasi</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="keperluan">Keperluan</label>
            <input
              type="text"
              id="keperluan"
              value={keperluan}
              onChange={(e) => setKeperluan(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hari">Berapa hari?</label>
            <input
              type="number"
              id="hari"
              value={hari}
              onChange={(e) => setHari(e.target.value)}
              placeholder="Contoh: 1, 2"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tanggal">Tanggal</label>
            <input
              type="date"
              id="tanggal"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Kirim Dispensasi'}
          </button>
        </form>
      </div>
      {notif.message && (
        <div className={`notification ${notif.type}`}>
          {notif.message}
        </div>
      )}
    </div>
  );
};

export default Dispensasi;
