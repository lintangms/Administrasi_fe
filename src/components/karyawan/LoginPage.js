import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/LoginPage.css'; // Pastikan file CSS ini ada dan sudah diimpor dengan benar

function LoginPage() {
  const [kodeAkun, setKodeAkun] = useState('');
  const [loading, setLoading] = useState(false); // State untuk status loading
  const [notif, setNotif] = useState({ message: '', type: '' }); // State untuk notifikasi
  const navigate = useNavigate();

  // URL backend dari environment variable
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleLogin = async () => {
    setLoading(true); // Set loading ke true sebelum login

    try {
      const response = await axios.post(`${BACKEND_URL}/api/login`, {
        kode_akun: kodeAkun,
      });

      console.log('Login response:', response); // Log respons dari backend

      // Menyimpan id_karyawan di localStorage
      localStorage.setItem('id_karyawan', response.data.user.id_karyawan);

      // Menampilkan notifikasi sukses login setelah login berhasil
      setNotif({ message: 'Login berhasil!', type: 'success' });

      setLoading(false); // Mengubah loading ke false setelah login selesai

      // Menghilangkan notifikasi setelah 2 detik
      setTimeout(() => {
        setNotif({ message: '', type: '' }); // Menghapus notifikasi
        // Redirect berdasarkan role setelah notifikasi hilang
        if (response.data.user.role === 'admin') {
          navigate('/admin'); // Arahkan ke halaman admin jika role admin
        } else {
          navigate('/user/dashboard'); // Arahkan ke dashboard user jika bukan admin
        }
      }, 2000); // Waktu cukup untuk menampilkan notifikasi
    } catch (err) {
      console.error('Login error: ', err); // Log error untuk debug

      // Menampilkan notifikasi error jika login gagal
      setNotif({
        message: 'Login gagal, pastikan kode akun Anda benar!',
        type: 'error',
      });

      setLoading(false); // Mengubah loading ke false jika terjadi error

      // Menghilangkan notifikasi setelah 2 detik
      setTimeout(() => {
        setNotif({ message: '', type: '' });
      }, 2000); // Waktu cukup untuk menampilkan notifikasi
    }
  };

  return (
    <div className="login-page">
      {/* Sisi Kiri - Gambar */}
      <div className="left-side">
        {/* Gambar atau ilustrasi bisa ditambahkan di sini */}
      </div>

      {/* Sisi Kanan - Form Login */}
      <div className="right-side">
        <div className="login-container">
          <h1>Selamat Datang</h1>
          <input
            type="text"
            placeholder="Kode Akun"
            value={kodeAkun}
            onChange={(e) => setKodeAkun(e.target.value)}
          />
          <button onClick={handleLogin} disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </div>
      </div>

      {/* Notifikasi */}
      {notif.message && (
        <div className={`notification ${notif.type}`}>
          {notif.message}
        </div>
      )}
    </div>
  );
}

export default LoginPage;
