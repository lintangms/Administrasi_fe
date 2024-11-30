import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrasi modul Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function KaryawanDashboard() {
  const [koinData, setKoinData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKoinData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/transaksi/koin-statistik`);
        console.log('API Response:', response.data); // Log respons API
        setKoinData(response.data.data); // Ambil data dari properti "data"
        setLoading(false);
      } catch (err) {
        console.error('Error fetching koin data:', err);
        setError('Tidak ada data');
        setLoading(false);
      }
    };

    fetchKoinData();
  }, []); // Jalankan sekali saat komponen di-mount


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!Array.isArray(koinData) || koinData.length === 0) {
    return <div>No data available</div>;
  }

  const chartData = {
    labels: koinData.map(item => item.nama),
    datasets: [
      {
        label: 'Total Koin TNL',
        data: koinData.map(item => parseInt(item.tnl_koin, 10)),
        backgroundColor: '#007bff', // Warna solid hijau
        borderRadius: 10, // Membuat ujung atas batang melengkung
        barThickness: 30, // Ukuran lebar batang
      },
      {
        label: 'Total Koin LA',
        data: koinData.map(item => parseInt(item.la_koin, 10)),
        backgroundColor: '#F44336', // Warna solid merah
        borderRadius: 10, // Membuat ujung atas batang melengkung
        barThickness: 30, // Ukuran lebar batang
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Statistik Koin',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hilangkan garis grid di sumbu X
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#E0E0E0', // Warna grid abu-abu terang
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Statistik Player</h1>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}

export default KaryawanDashboard;
