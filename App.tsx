import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import Beranda from './Beranda.tsx'
import Berita from './Berita.tsx'
import './App.css'

const aktifJika = ({ isActive }: { isActive: boolean }) => (isActive ? 'aktif' : '')

function App() {
  return (
    <HashRouter>
      <header className="header">
        <h1>KampusHub</h1>
        <p>Papan pengumuman Universitas Wahidiyah Kota Kediri</p>
      </header>

      <nav className="nav" aria-label="Menu utama">
        <NavLink to="/" end className={aktifJika}>Beranda</NavLink>
        <NavLink to="/berita" className={aktifJika}>Berita</NavLink>
      </nav>

      <main className="main">
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/berita" element={<Berita />} />
        </Routes>
      </main>

      <footer className="footer">Pemrograman Web · 2026 · Nama Mahasiswa / NIM12345</footer>
    </HashRouter>
  )
}

export default App
