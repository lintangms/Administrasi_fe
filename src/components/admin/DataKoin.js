import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Data.css'; // Ensure this CSS file exists and is linked

const DataKoin = () => {
  const [koinList, setKoinList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedKoin, setSelectedKoin] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [jumlahDijual, setJumlahDijual] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [server, setServer] = useState('');
  const [demand, setDemand] = useState('');
  const [rate, setRate] = useState('');

  // State for filter and pagination
  const [filters, setFilters] = useState({
    id_karyawan: '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchFilteredKoin = async () => {
      setLoading(true);
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Get URL from environment variable
        const response = await axios.get(`${BACKEND_URL}/api/transaksi/koinupdate`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: { ...filters, page, limit },
        });

        if (response.data && response.data.data) {
          setKoinList(response.data.data);
          setTotal(response.data.total); // Get total data for pagination
        } else {
          setKoinList([]);
        }
      } catch (err) {
        console.error('Failed to fetch koin data:', err);
        setError('Failed to fetch koin data.');
        setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredKoin();
  }, [filters, page, limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleDetailClick = (koin) => {
    setSelectedKoin(koin);
    setShowDetailModal(true);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset to the first page when limit changes
  };

  const handleButtonClick = (koin) => {
    setSelectedKoin(koin);
    setJumlahDijual('');
    setTanggal('');
    setServer('');
    setDemand('');
    setRate('');
    setShowModal(true);
  };

  const handleSellKoin = async () => {
    if (!selectedKoin) {
      setError('Selected transaction not found!');
      setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
      return;
    }

    const idKoin = selectedKoin.id_koin; // Ensure id_koin exists in koin data

    if (!idKoin) {
      setError('Koin ID not found!');
      setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
      return;
    }

    if (!jumlahDijual || jumlahDijual <= 0) {
      setError('Jumlah dijual harus lebih dari 0!');
      setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
      return;
    }

    if (!tanggal || !server || !demand || !rate) {
      setError('All data for sale must be filled!');
      setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/sellkoins/${idKoin}`,
        { 
          jumlah_dijual: Number(jumlahDijual), // Ensure this is a number
          tanggal,
          server,
          demand,
          rate: Number(rate) // Ensure this is a number
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage('Koin berhasil dijual!');
        setKoinList((prevKoinList) =>
          prevKoinList.map((koin) =>
            koin.id_koin === selectedKoin.id_koin
              ? {
                  ...koin,
                  jumlah_dijual: koin.jumlah_dijual + Number(jumlahDijual),
                  jumlah_sisa: koin.jumlah_sisa - Number(jumlahDijual),
                }
              : koin
          )
        );
        setShowModal(false);
      }
    } catch (err) {
      console.error('Failed to sell koin:', err.response ? err.response.data : err);
      setError(`Gagal menjual koin: ${err.response?.data?.error || 'Coba lagi nanti.'}`);
      setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
    } finally {
      // Clear notifications after 3 seconds
      setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 3000);
    }
  };

  return (
    <div className="data-container">
      <h2>Data Koin</h2>

      {/* Notification Messages */}
      {successMessage && <div className="notification success">{successMessage}</div>}
      {error && <div className="notification error">{error}</div>}

      {/* Form Filter */}
      <div className="filter-container">
        <input
          type="text"
          name="id_karyawan"
          placeholder="Cari ID Karyawan"
          value={filters.id_karyawan}
          onChange={handleFilterChange}
          className="filter-input"
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Akun Steam</th>
            {/* <th>Akun Gmail</th> */}
            <th>Shift</th>
            <th>Jenis</th>
            <th>Jumlah Awal</th>
            <th>Jumlah Dijual</th>
            <th>Jumlah Sisa</th>
            <th>Waktu</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {koinList.length > 0 ? (
            koinList.map((koin, index) => (
              <tr key={koin.id_koin}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td>{koin.nama}</td>
                <td>{koin.akun_steam}</td>
                {/* <td>{koin.akun_gmail}</td> */}
                <td>{koin.shift}</td>
                <td>{koin.jenis}</td>
                <td>{koin.jumlah_awal}</td>
                <td>{koin.jumlah_dijual}</td>
                <td>{koin.jumlah_sisa}</td>
                <td>{new Date(koin.waktu).toLocaleString()}</td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleDetailClick(koin)}
                  >
                    Detail
                  </button>
                  <button
                    className="btn-action"
                    onClick={() => handleButtonClick(koin)}
                    style={{ marginLeft: '5px' }}
                  >
                    Jual Koin
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11">Tidak ada data koin tersedia</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-left">
          <label>Jumlah Data:</label>
          <select value={limit} onChange={handleLimitChange} className="small-select">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={total}>Semua</option>
          </select>
        </div>
        <div className="pagination-right">
          {total > 0 && limit > 0 && (
            <>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                &lt;
              </button>
              {[...Array(Math.ceil(total / limit)).keys()].map((num) => {
                const pageNumber = num + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === Math.ceil(total / limit) ||
                  (pageNumber >= page - 2 && pageNumber <= page + 2)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      className={`pagination-btn ${page === pageNumber ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === Math.ceil(total / limit)}
              >
                &gt;
              </button>
            </>
          )}
        </div>
      </div>
{/* Modal untuk Jual Koin */}
{showModal && (
  <div className="modal show" style={{ display: 'block' }}>
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Jual Koin</h5>
          
        </div>
        <div className="modal-body">
          <div className="modal-row">
            <div className="modal-input">
              <label htmlFor="jumlahDijual">Jumlah Dijual</label>
              <input
                type="number"
                className="form-control"
                id="jumlahDijual"
                value={jumlahDijual}
                onChange={(e) => setJumlahDijual(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-row">
            <div className="modal-input">
              <label htmlFor="tanggal">Tanggal</label>
              <input
                type="date"
                className="form-control"
                id="tanggal"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </div>
            <div className="modal-input">
              <label htmlFor="server">Server</label>
              <input
                type="text"
                className="form-control"
                id="server"
                value={server}
                onChange={(e) => setServer(e.target.value)}
              />
            </div>
            <div className="modal-input">
              <label htmlFor="demand">Demand</label>
              <input
                type="text"
                className="form-control"
                id="demand"
                value={demand}
                onChange={(e) => setDemand(e.target.value)}
              />
            </div>
            <div className="modal-input">
              <label htmlFor="rate">Rate</label>
              <input
                type="number"
                className="form-control"
                id="rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Tutup
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSellKoin}>
            Jual
          </button>
        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default DataKoin;