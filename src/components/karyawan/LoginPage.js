import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/LoginPage.css'; // Pastikan file CSS ini ada dan diimpor dengan benar

function LoginPage() {
  const [kodeAkun, setKodeAkun] = useState(''); // State untuk kode akun
  const [loading, setLoading] = useState(false); // State untuk status loading
  const [notif, setNotif] = useState({ message: '', type: '' }); // State untuk notifikasi
  const navigate = useNavigate();

  // URL backend dari environment variable atau fallback
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Fungsi login
  const handleLogin = async () => {
    setLoading(true); // Set status loading menjadi true

    try {
      const response = await axios.post(`${BACKEND_URL}/api/login`, {
        kode_akun: kodeAkun, // Kirim kode_akun saja
      });
      console.log('Login response:', response); 

      console.log('Login response:', response); // Log respons dari backend untuk debug

      // Cek jika response memiliki data yang diinginkan
      if (response.data && response.data.user) {
        // Menyimpan id_karyawan dan token di localStorage
        localStorage.setItem('id_karyawan', response.data.user.id_karyawan);
        localStorage.setItem('token', response.data.token); // Simpan token JWT

        // Menampilkan notifikasi sukses login
        setNotif({ message: 'Login berhasil!', type: 'success' });

        setLoading(false); // Mengubah loading ke false setelah login selesai

        // Menghilangkan notifikasi setelah 2 detik
        setTimeout(() => {
          setNotif({ message: '', type: '' }); // Menghapus notifikasi
          // Redirect berdasarkan role
          if (response.data.user.role === 'admin') {
            navigate('/admin'); // Redirect ke halaman admin
          } else {
            navigate('/user/dashboard'); // Redirect ke dashboard user
          }
        }, 2000);
      } else {
        throw new Error('Invalid response format'); // Tangani jika format respons tidak sesuai
      }
    } catch (err) {
      console.error('Login error:', err); // Log error untuk debug

      // Notifikasi error jika login gagal
      setNotif({
        message: 'Login gagal! Pastikan kode akun Anda benar.',
        type: 'error',
      });

      setLoading(false); // Mengubah status loading menjadi false

      // Menghilangkan notifikasi setelah 2 detik
      setTimeout(() => {
        setNotif({ message: '', type: '' });
      }, 2000);
    }
  };

  return (
    <div className="login-page">
      <div className="left-side">
        {/* Tambahkan elemen gambar atau ilustrasi di sini */}
      </div>

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

      {notif.message && (
        <div className={`notification ${notif.type}`}>
          {notif.message}
        </div>
      )}
    </div>
  );
}

export default LoginPage;
