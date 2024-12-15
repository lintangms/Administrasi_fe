import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/Absensi.css'; // File CSS untuk styling

const Unsold = () => {
  const [akunSteam, setAkunSteam] = useState('');
  const [akunGmail, setAkunGmail] = useState('');
  const [shift, setShift] = useState('');
  const [jumlahAwal, setJumlahAwal] = useState('');
  const [jenis, setJenis] = useState('');
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

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!akunSteam || !akunGmail || !shift || !jumlahAwal || !jenis || !idKaryawan) {
      setNotif({ message: 'Semua field wajib diisi!', type: 'error' });
      setLoading(false);
      return;
    }

    const unsoldData = {
      akun_steam: akunSteam,
      akun_gmail: akunGmail,
      shift,
      jumlah_awal: jumlahAwal,
      jenis,
    };

    try {
      const response = await axios.post(`${BACKEND_URL}/api/addunsold/${idKaryawan}`, unsoldData);

      if (response.data.success) {
        setNotif({ message: 'Data Unsold berhasil ditambahkan!', type: 'success' });
        setAkunSteam('');
        setAkunGmail('');
        setShift('');
        setJumlahAwal('');
        setJenis('');
      } else {
        setNotif({ message: 'Gagal menambahkan data Unsold.', type: 'error' });
      }
    } catch (err) {
      console.error('Error saat menambahkan data Unsold:', err);
      setNotif({ message: 'Terjadi kesalahan saat mengirim data!', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setNotif({ message: '', type: '' });
      }, 2000);
    }
  };

  return (
    <div className="unsold-page">
      <div className="unsold-card">
        <h2>Form Unsold</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="akunSteam">Akun Steam</label>
            <input
              type="text"
              id="akunSteam"
              value={akunSteam}
              onChange={(e) => setAkunSteam(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="akunGmail">Akun Gmail</label>
            <input
              type="email"
              id="akunGmail"
              value={akunGmail}
              onChange={(e) => setAkunGmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="jumlahAwal">Jumlah Awal</label>
            <input
              type="number"
              id="jumlahAwal"
              value={jumlahAwal}
              onChange={(e) => setJumlahAwal(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Shift</label>
            <div className="radio-group-vertical">
              <label className={`radio-option ${shift === 'siang' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="shift"
                  value="siang"
                  onChange={(e) => setShift(e.target.value)}
                  checked={shift === 'siang'}
                />
                Siang
              </label>
              <label className={`radio-option ${shift === 'malam' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="shift"
                  value="malam"
                  onChange={(e) => setShift(e.target.value)}
                  checked={shift === 'malam'}
                />
                Malam
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Jenis Game</label>
            <div className="radio-group-vertical">
              <label className={`radio-option ${jenis === 'LA' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="jenis"
                  value="LA"
                  onChange={(e) => setJenis(e.target.value)}
                  checked={jenis === 'LA'}
                />
                Lost Ark (LA)
              </label>
              <label className={`radio-option ${jenis === 'TNL' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="jenis"
                  value="TNL"
                  onChange={(e) => setJenis(e.target.value)}
                  checked={jenis === 'TNL'}
                />
                Throne and Liberty (TNL)
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Tambah Unsold'}
          </button>
        </form>
        {notif.message && (
          <div className={`notification ${notif.type}`}>
            {notif.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Unsold;
