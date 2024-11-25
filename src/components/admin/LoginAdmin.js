import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/LoginPage.css'; // Pastikan file CSS ini tersedia dan sudah diimpor dengan benar

function LoginAdmin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // State untuk status loading
  const [notif, setNotif] = useState({ message: '', type: '' }); // State untuk notifikasi
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true); // Set loading ke true sebelum login

    try {
      // Mengambil URL dari environment variable
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

      // Melakukan request POST untuk login
      const response = await axios.post(`${BACKEND_URL}/api/loginadmin`, {
        username,
        password,
      });

      console.log('Login response:', response); // Log respons dari backend

      // Simpan token admin di localStorage
      localStorage.setItem('admin_token', response.data.token);

      // Menampilkan notifikasi sukses login
      setNotif({ message: 'Login berhasil!', type: 'success' });

      setLoading(false); // Mengubah loading ke false setelah login selesai

      // Menghilangkan notifikasi setelah 2 detik dan arahkan ke dashboard admin
      setTimeout(() => {
        setNotif({ message: '', type: '' }); // Menghapus notifikasi
        navigate('/admin/dashboard'); // Arahkan ke dashboard admin
      }, 2000); // Waktu cukup untuk menampilkan notifikasi
    } catch (err) {
      console.error('Login error:', err); // Log error untuk debug

      // Menampilkan notifikasi error jika login gagal
      if (err.response && err.response.data) {
        setNotif({ message: err.response.data.error || 'Login gagal, periksa username dan password.', type: 'error' });
      } else {
        setNotif({ message: 'Terjadi kesalahan, coba lagi.', type: 'error' });
      }

      setLoading(false); // Mengubah loading ke false jika terjadi error

      // Menghilangkan notifikasi setelah 2 detik
      setTimeout(() => {
        setNotif({ message: '', type: '' });
      }, 2000); // Waktu cukup untuk menampilkan notifikasi
    }
  };

  return (
    <div className="login-page">
      {/* Sisi Kiri - Gambar atau ilustrasi */}
      <div className="left-side">
        {/* Tambahkan gambar jika diperlukan */}
      </div>

      {/* Sisi Kanan - Form Login */}
      <div className="right-side">
        <div className="login-container">
          <h1>Admin Login</h1>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

export default LoginAdmin;
