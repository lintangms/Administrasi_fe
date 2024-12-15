import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../../css/Admindashboard.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { FaUsers, FaCoins, FaMoneyBillWave } from 'react-icons/fa';

// Registrasi modul Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, Filler);

function AdminDashboard() {
  const [koinData, setKoinData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalKaryawan: 0, totalKoinTNL: 0, totalKoinLA: 0, totalKasbon: 0 });
  const [gameStats, setGameStats] = useState(null);
  const [topKaryawan, setTopKaryawan] = useState([]);
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
  const [period, setPeriod] = useState('DAY'); // State untuk memilih periode

  useEffect(() => {
    const fetchData = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

        // Ambil statistik transaksi
        const responseStats = await axios.get(`${BACKEND_URL}/api/transaksi/getstats`);
        if (responseStats.data.success) {
          setStats({
            totalKaryawan: responseStats.data.data.total_karyawan,
            totalKoinTNL: parseInt(responseStats.data.data.total_koin_tnl, 10),
            totalKoinLA: parseInt(responseStats.data.data.total_koin_la, 10),
            totalKasbon: parseInt(responseStats.data.data.total_kasbon, 10),
          });
        }

        // Ambil statistik koin
        const responseKoin = await axios.get(`${BACKEND_URL}/api/transaksi/koin-statistik`);
        setKoinData(responseKoin.data.data);

        // Ambil statistik karyawan bermain game
        const responseGameStats = await axios.get(`${BACKEND_URL}/api/transaksi/karyawangame`);
        if (responseGameStats.data.success) {
          setGameStats(responseGameStats.data.data);
        }

        // Ambil top 5 karyawan
        const responseTopKaryawan = await axios.get(`${BACKEND_URL}/api/transaksi/karyawantop`);
        if (responseTopKaryawan.data.success) {
          setTopKaryawan(responseTopKaryawan.data.data);
        }

        // Ambil data untuk line chart berdasarkan periode yang dipilih
        await fetchLineChartData('2023-01-01', '2027-12-31', period);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Tidak ada data');
        setLoading(false);
      }
    };

    fetchData();
  }, [period]); // Menambahkan period ke dalam dependency array

  const fetchLineChartData = async (startDate, endDate, groupBy) => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const responseLineChart = await axios.get(`${BACKEND_URL}/api/transaksi/statsperiode`, {
      params: { startDate, endDate, groupBy },
    });
    if (responseLineChart.data.success) {
      const labels = responseLineChart.data.data.map(item => item.period);
      const totalKoinTNL = responseLineChart.data.data.map(item => item.total_koin_tnl);
      const totalKoinLA = responseLineChart.data.data.map(item => item.total_koin_la);
      setLineChartData({
        labels,
        datasets: [
          {
            label: 'Total Koin TNL',
            data: totalKoinTNL,
            borderColor: '#d9534f',
            backgroundColor: 'rgba(255, 38, 0, 0.100)',
            fill: true,
          },
          {
            label: 'Total Koin LA',
            data: totalKoinLA,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
           
            fill: true,
          },
        ],
      });
    }
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

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
        backgroundColor: '#d9534f',
        borderRadius: 10,
        barThickness: 30,
      },
      {
        label: 'Total Koin LA',
        data: koinData.map(item => parseInt(item.la_koin, 10)),
        backgroundColor: '#007bff',
        borderRadius: 10,
        barThickness: 30,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
          display: false,
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
          color: '#E0E0E0',
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
    },
  };
  

  const pieChartData = {
    labels: ['Karyawan TNL', 'Karyawan LA'],
    datasets: [
      {
        label: 'Karyawan per Game',
        data: [
          gameStats ? gameStats.total_karyawan_tnl : 0,
          gameStats ? gameStats.total_karyawan_la : 0,
        ],
        backgroundColor: ['#d9534f', '#007bff'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Karyawan Berdasarkan Game',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
    },
    cutout: '70%',
  };

  return (
    
    <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 20%', margin: '10px' }}>
          <FaUsers size={30} color="#007bff" style={{ marginRight: '10px' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', color: '#808080' }}>Total Karyawan</h4>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{stats.totalKaryawan}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 20%', margin: '10px' }}>
          <FaCoins size={30} color="#4CAF50" style={{ marginRight: '10px' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', color: '#808080' }}>Total Koin TNL</h4>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{stats.totalKoinTNL}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 20%', margin: '10px' }}>
          <FaCoins size={30} color="#FFEB3B" style={{ marginRight: '10px' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', color: '#808080' }}>Total Koin LA</h4>
            <p style={{ margin: 0, fontSize: '24px ', fontWeight: 'bold' }}>{stats.totalKoinLA}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 20%', margin: '10px' }}>
          <FaMoneyBillWave size={30} color="#F44336" style={{ marginRight: '10px' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', color: '#808080' }}>Total Kasbon </h4>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{stats.totalKasbon}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
  <div style={{ ...chartCardStyle, flex: '0 0 66%', overflowX: 'auto' }}>
    <div
      style={{
        minWidth: `${Math.max(800, chartData.labels.length * 100)}px`,
        height: '400px', // Tinggi bar chart diperbesar menjadi 500px
      }}
    >
      {/* Lebar minimal 800px, tapi akan bertambah sesuai jumlah data */}
      <Bar data={chartData} options={chartOptions} />
    </div>
  </div>
  <div style={{ ...chartCardStyle, flex: '0 0 20%' }}>
    {gameStats && (
      <>
        <Pie data={pieChartData} options={pieChartOptions} />
        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', color: '#808080' }}>
          Game LA: {gameStats.total_karyawan_la} | Game TNL: {gameStats.total_karyawan_tnl}
        </p>
      </>
    )}
  </div>
</div>



      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        <div style={{ ...chartCardStyle, flex: '0 0 25%' }}>
          <h4 style={{ textAlign: 'center', marginTop: '0', fontSize: '18px', color: '#808080' }}>Top 5 Karyawan dengan Koin Terbanyak</h4>
          {topKaryawan.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nama</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>TNL</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>LA</th>
                </tr>
              </thead>
              <tbody>
                {topKaryawan.map((karyawan, index) => (
                  <tr key={karyawan.id_karyawan} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#ffffff', borderBottom: '1px solid #ffffff' }}>
                    <td style={{ padding: '10px', textAlign: 'left' }}>{karyawan.nama}</td>
                    <td style={{ padding: '10px', textAlign: 'left' }}>{karyawan.total_koin_tnl}</td>
                    <td style={{ padding: '10px', textAlign: 'left' }}>{karyawan.total_koin_la}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#808080' }}>Tidak ada data karyawan</p>
          )}
        </div>
        <div style={{ ...chartCardStyle, flex: '0 0 66%' }}>
        <div style={{ marginTop: '20px' }}>
        <label htmlFor="period-select" style={{ marginRight: '10px' }}>Pilih Periode:</label>
        <select id="period-select" value={period} onChange={handlePeriodChange}>
          <option value="DAY">Hari</option>
          <option value="MONTH">Bulan</option>
          <option value="WEEK">Minggu</option>
        </select>
      </div>
          <Line 
            data={{
              ...lineChartData,
              datasets: lineChartData.datasets.map(dataset => ({
                ...dataset,
                tension: 0.4, // Membuat garis menjadi smooth
              })),
            }} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Total Koin Periode',
                  font: {
                    size: 18,
                    weight: 'bold',
                  },
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
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
                    color: '#E0E0E0',
                  },
                  ticks: {
                    font: {
                      size: 14,
                    },
                  },
                },
              },
            }} 
          />
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'row',
  margin: '20px 0',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
};

const chartCardStyle = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
};

export default AdminDashboard;