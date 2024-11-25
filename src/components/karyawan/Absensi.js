import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/Absensi.css'; // Pastikan file CSS ini tersedia

const Absensi = () => {
  const [akunSteam, setAkunSteam] = useState('');
  const [akunGmail, setAkunGmail] = useState('');
  const [shift, setShift] = useState('');
  const [jumlahKoin, setJumlahKoin] = useState('');
  const [kodeAkun, setKodeAkun] = useState('');
  const [keterangan, setKeterangan] = useState('');
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
  
    if (!akunSteam || !akunGmail || !shift || !jumlahKoin || !keterangan || !jenis || !idKaryawan) {
      setNotif({ message: 'Semua field wajib diisi!', type: 'error' });
      setLoading(false);
      return;
    }
  
    const absensiData = {
      akun_steam: akunSteam,
      akun_gmail: akunGmail,
      shift,
      jumlah_awal_koin: jumlahKoin,
      kode_akun: kodeAkun || null,
      keterangan,
      jenis,
    };
  
    try {
      const response = await axios.post(`${BACKEND_URL}/transaksi/akun/${idKaryawan}`, absensiData);
  
      if (response.data.success) {
        setNotif({ message: 'Absensi berhasil dicatat!', type: 'success' });
        setAkunSteam('');
        setAkunGmail('');
        setShift('');
        setJumlahKoin('');
        setKodeAkun('');
        setKeterangan('');
        setJenis('');
      } else {
        setNotif({ message: 'Gagal mencatat absensi.', type: 'error' });
      }
    } catch (err) {
      console.error('Error saat mencatat absensi:', err);
      setNotif({ message: 'Terjadi kesalahan saat mengirim data!', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setNotif({ message: '', type: '' });
      }, 2000);
    }
  };
  
  return (
    <div className="absensi-container">
      <div className="image-left"></div>

      <div className="form-right">
        <h2>Form Absensi</h2>

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
            <label htmlFor="jumlahKoin">Jumlah Koin</label>
            <input
              type="number"
              id="jumlahKoin"
              value={jumlahKoin}
              onChange={(e) => setJumlahKoin(e.target.value)}
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
  <label>Keterangan</label>
  <div className="radio-group-vertical">
    <label className={`radio-option ${keterangan === 'masuk' ? 'selected' : ''}`}>
      <input
        type="radio"
        name="keterangan"
        value="masuk"
        onChange={(e) => setKeterangan(e.target.value)}
        checked={keterangan === 'masuk'}
      />
      Masuk
    </label>
    <label className={`radio-option ${keterangan === 'pulang' ? 'selected' : ''}`}>
      <input
        type="radio"
        name="keterangan"
        value="pulang"
        onChange={(e) => setKeterangan(e.target.value)}
        checked={keterangan === 'pulang'}
      />
      Pulang
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
            {loading ? 'Loading...' : 'Kirim Absensi'}
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

export default Absensi;
