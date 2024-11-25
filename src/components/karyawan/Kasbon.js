import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/Kasbon.css'; // Pastikan file CSS ini tersedia

const Kasbon = () => {
  const [nominal, setNominal] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [cicilan, setCicilan] = useState('');
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
    if (!nominal || !keperluan || !cicilan || !idKaryawan) {
      setNotif({ message: 'Semua field wajib diisi!', type: 'error' });
      setLoading(false);
      return;
    }
  
    // Hapus format titik pada nominal
    const rawNominal = nominal.replace(/\./g, ''); // Hapus semua titik dari nominal
  
    const kasbonData = {
      nominal: rawNominal, // Kirim data nominal tanpa format
      keperluan,
      cicilan,
    };
  
    try {
      const response = await axios.post(`${BACKEND_URL}/api/addkasbon/${idKaryawan}`, kasbonData);
  
      if (response.data.success) {
        setNotif({ message: 'Kasbon berhasil dicatat!', type: 'success' });
        setNominal('');
        setKeperluan('');
        setCicilan('');
      } else {
        setNotif({ message: 'Gagal mencatat kasbon.', type: 'error' });
      }
    } catch (err) {
      console.error('Error saat mencatat kasbon:', err);
      setNotif({ message: 'Terjadi kesalahan saat mengirim data!', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setNotif({ message: '', type: '' });
      }, 2000);
    }
  };
  

  return (
    <div className="kasbon-container">
      <div className="image-left"></div>

      <div className="form-right">
        <h2>Form Kasbon</h2>

        <form onSubmit={handleSubmit}>
        <div className="form-group">
  <label htmlFor="nominal">Nominal Kasbon</label>
  <input
    type="text" // Ubah type dari "number" ke "text" agar format dengan titik dapat diterapkan
    id="nominal"
    value={nominal}
    onChange={(e) => {
      const value = e.target.value.replace(/\./g, ''); // Hilangkan semua titik sebelum proses
      if (!isNaN(value)) {
        const formattedValue = parseInt(value || '0', 10).toLocaleString('id-ID'); // Format ke "1.000.000"
        setNominal(formattedValue);
      }
    }}
    required
  />
</div>


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
            <label>Cicilan</label>
            <div className="radio-group-vertical">
              <label className={`radio-option ${cicilan === '1' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="cicilan"
                  value="1"
                  onChange={(e) => setCicilan(e.target.value)}
                  checked={cicilan === '1'}
                />
                1 Bulan
              </label>
              <label className={`radio-option ${cicilan === '2' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="cicilan"
                  value="2"
                  onChange={(e) => setCicilan(e.target.value)}
                  checked={cicilan === '2'}
                />
                2 Bulan
              </label>
              <label className={`radio-option ${cicilan === '3' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="cicilan"
                  value="3"
                  onChange={(e) => setCicilan(e.target.value)}
                  checked={cicilan === '3'}
                />
                3 Bulan
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Kirim Kasbon'}
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

export default Kasbon;
