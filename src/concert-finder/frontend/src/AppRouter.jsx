import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './Login';
import Conciertos from './Conciertos';
import ConciertoDetalle from './ConciertoDetalle';
import MisGustos from './MisGustos';
import SpotifyCallback from './SpotifyCallback';

function Navbar() {
  const location = useLocation();
  if (location.pathname === '/') return null; // No mostrar menú en el login

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: 'var(--bg-cream)', borderBottom: 'var(--border-thick)' }}>
      <h2 style={{ margin: 0, fontSize: '2rem' }}>REWIND</h2>
      <div style={{ display: 'flex', gap: '30px', fontWeight: 'bold', fontSize: '0.9rem' }}>
        <Link to="/stats" style={{ color: 'black', textDecoration: 'none' }}>MIS GUSTOS</Link>
        <Link to="/conciertos" style={{ color: 'black', textDecoration: 'none' }}>CONCIERTOS</Link>
      </div>
      <Link to="/" onClick={() => {
        localStorage.removeItem('rewind:token');
        localStorage.removeItem('rewind:user');
        localStorage.removeItem('rewind:lastfmUser');
        localStorage.removeItem('rewind:lastfmStats');
      }}><button className="retro-btn">SALIR</button></Link>
    </nav>
  );
}

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/oauth/spotify" element={<SpotifyCallback />} />
        <Route path="/conciertos" element={<Conciertos />} />
        <Route path="/concierto/:id" element={<ConciertoDetalle />} />
        <Route path="/stats" element={<MisGustos />} />
      </Routes>
    </>
  );
}