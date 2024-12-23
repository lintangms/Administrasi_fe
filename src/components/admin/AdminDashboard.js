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
  const [koinKaryawanData, setKoinKaryawanData] = useState({ labels: [], datasets: [] });
  const [period, setPeriod] = useState('DAY'); // State untuk memilih periode
  const [bulan, setBulan] = useState(new Date().getMonth() + 1); // State untuk bulan
  const [tahun, setTahun] = useState(new Date().getFullYear()); // State untuk tahun

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
        await fetchKoinKaryawanData(bulan, tahun); // Fetch data Koin Karyawan

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Tidak ada data');
        setLoading(false);
      }
    };

    fetchData();
  }, [period, bulan, tahun]); // Menambahkan bulan dan tahun ke dalam dependency array

  const fetchLineChartData = async (startDate, endDate, groupBy) => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const responseLineChart = await axios.get(`${BACKEND_URL}/api/transaksi/statsperiode`, {
      params: { startDate, endDate, groupBy },
    });
    if (responseLineChart.data.success) {
      const labels = responseLineChart.data.data.map(item => item.period);
      const totalKoinTNL = responseLineChart.data.data.map(item => item.total_koin_tnl);
      const totalKoinLA = responseLineChart.data.data.map(item => item.total_koin_la);
      const totalTNLTerjual = responseLineChart.data.data.map(item => item.tnl_terjual); // Menambahkan TNL_TERJUAL
      const totalLATerjual = responseLineChart.data.data.map(item => item.la_terjual); // Menambahkan LA_TERJUAL
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
          {
            label: 'Total TNL Terjual',
            data: totalTNLTerjual,
            borderColor: '#ff69b4', // Warna untuk TNL Terjual
            backgroundColor: 'rgba(255, 105, 180, 0.2)',
            fill: true,
          },
          {
            label: 'Total LA Terjual',
            data: totalLATerjual,
            borderColor: '#add8e6', // Warna untuk LA Terjual
            backgroundColor: 'rgba(173, 216, 230, 0.2)',
            fill: true,
          },
        ],
      });
    }
  };

  const fetchKoinKaryawanData = async (bulan, tahun) => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const responseKoinKaryawan = await axios.get(`${BACKEND_URL}/api/transaksi/koinkaryawan`, {
      params: { bulan, tahun },
    });
    if (responseKoinKaryawan.data.success) {
      const labels = responseKoinKaryawan.data.data.map(item => item.nama);
      const totalKoinTNL = responseKoinKaryawan.data.data.map(item => item.tnl_koin);
      const totalDijualTNL = responseKoinKaryawan.data.data.map(item => item.tnl_dijual); // Menggunakan TNL_DIJUAL
      const totalKoinLA = responseKoinKaryawan.data.data.map(item => item.la_koin);
      const totalDijualLA = responseKoinKaryawan.data.data.map(item => item.la_dijual); // Menggunakan LA_DIJUAL
      setKoinKaryawanData({
        labels,
        datasets: [
          {
            label: 'Total Koin TNL',
            data: totalKoinTNL,
            backgroundColor: '#d9534f',
            borderRadius: 10,
            barThickness: 30,
            stack: 'Stack 0',
          },
          {
            label: 'Total Dijual TNL',
            data: totalDijualTNL,
            backgroundColor: '#d41710', // Warna pink untuk TNL Dijual
            borderRadius: 10,
            barThickness: 30,
            stack: 'Stack 0',
          },
          {
            label: 'Total Koin LA',
            data: totalKoinLA,
            backgroundColor: '#007bff',
            borderRadius: 10,
            barThickness: 30,
            stack: 'Stack 1',
          },
          {
            label: 'Total Dijual LA',
            data: totalDijualLA,
            backgroundColor: '#add8e6', // Warna biru muda untuk LA Dijual
            borderRadius: 10,
            barThickness: 30,
            stack: 'Stack 1',
          },
        ],
      });
    }
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  const handleBulanChange = (event) => {
    setBulan(event.target.value);
    fetchKoinKaryawanData(event.target.value, tahun); // Fetch data Koin Karyawan saat bulan berubah
  };

  const handleTahunChange = (event) => {
    setTahun(event.target.value);
    fetchKoinKaryawanData(bulan, event.target.value); // Fetch data Koin Karyawan saat tahun berubah
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

  const chartData = 
{
    labels: koinData.map(item => item.nama),
    datasets: [
      {
        label: 'Total Koin TNL',
        data: koinData.map(item => parseInt(item.tnl_koin, 10)),
        backgroundColor: '#d9534f',
        borderRadius: 10,
        barThickness: 30,
        stack: 'Stack 0',
      },
      {
        label: 'Total Dijual TNL',
        data: koinData.map(item => parseInt(item.tnl_terjual, 10)),
        backgroundColor: '#d41710', // Warna pink untuk TNL Dijual
        borderRadius: 10,
        barThickness: 30,
        stack: 'Stack 0',
      },
      {
        label: 'Total Koin LA',
        data: koinData.map(item => parseInt(item.la_koin, 10)),
        backgroundColor: '#007bff',
        borderRadius: 10,
        barThickness: 30,
        stack: 'Stack 1',
      },
      {
        label: 'Total Dijual LA',
        data: koinData.map(item => parseInt(item.la_terjual, 10)),
        backgroundColor: '#0056b3', // Warna biru muda untuk LA Dijual
        borderRadius: 10,
        barThickness: 30,
        stack: 'Stack 1',
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
        text: 'Statistik Koin', //STATISTIK KOIN
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
        stacked: true, // Menambahkan properti stacked
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

  const koinKaryawanChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Koin Karyawan',
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
        stacked: true, // Menambahkan properti stacked
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
            <p style={{ margin: 0, fontSize: '24 px', fontWeight: 'bold' }}>{stats.totalKaryawan}</p>
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
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{stats.totalKoinLA}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 20%', margin: '10px' }}>
          <FaMoneyBillWave size={30} color="#F44336" style={{ marginRight: '10px' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', color: '#808080' }}>Total Kasbon</h4>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{stats.totalKasbon}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <div style={{ ...chartCardStyle, flex: '0 66%', overflowX: 'auto' }}>
          <div
            style={{
              minWidth: `${Math.max(800, chartData.labels.length * 60)}px`,
              height: '400px',
            }}
          >
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
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Koin</th>
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
          <Line 
            data={{
              ...lineChartData,
              datasets: lineChartData.datasets.map(dataset => ({
                ...dataset,
                tension: 0.4,
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        <div style={{ ...chartCardStyle, flex: '0 0 97%', overflowX: 'auto' }}>
          <h4 style={{ textAlign: 'center', marginTop: '0', fontSize: '18px', color: '#808080' }}></h4>
          <div style={{ marginTop: '20px' }}>
            <label htmlFor="bulan-select" style={{ marginRight: '10px' }}>Pilih Bulan:</label>
            <select id="bulan-select" value={bulan} onChange={handleBulanChange}>
              {[...Array(12).keys()].map(i => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <label htmlFor="tahun-select" style={{ marginLeft: '20px', marginRight: '10px' }}>Pilih Tahun:</label>
            <select id="tahun-select" value={tahun} onChange={handleTahunChange}>
              {[2022, 2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div
            style={{
              minWidth: `${Math.max(1300, koinKaryawanData.labels.length * 50)}px`,
              height: '500px',
            }}
          >
            <Bar data={koinKaryawanData} options={koinKaryawanChartOptions} />
          </div>
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