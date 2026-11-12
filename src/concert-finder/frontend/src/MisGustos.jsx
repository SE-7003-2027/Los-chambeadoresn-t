import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const colores = ['var(--rewind-red)', 'var(--rewind-blue)', 'var(--rewind-green)', 'var(--rewind-yellow)'];

export default function MisGustos() {
  const [usuario, setUsuario] = useState('');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    const token = localStorage.getItem('rewind:token');
    if (!token) return undefined;

    const cargarCuenta = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!activo || !response.data.lastfmUsername) return;
        setUsuario(response.data.lastfmUsername);
        const gustosResponse = await axios.get(`${API_URL}/api/lastfm/stats`, {
          params: { username: response.data.lastfmUsername },
        });
        if (activo) {
          setDatos(gustosResponse.data);
          localStorage.setItem('rewind:lastfmUser', response.data.lastfmUsername);
          localStorage.setItem('rewind:lastfmStats', JSON.stringify(gustosResponse.data));
        }
      } catch {
        localStorage.removeItem('rewind:token');
        localStorage.removeItem('rewind:user');
        if (activo) setError('Tu sesión expiró. Inicia sesión para recuperar tus gustos guardados.');
      }
    };

    const cargaInicial = window.setTimeout(cargarCuenta, 0);
    return () => {
      activo = false;
      window.clearTimeout(cargaInicial);
    };
  }, []);

  const consultarGustos = async (event) => {
    event.preventDefault();
    if (!usuario.trim()) {
      setError('Escribe tu usuario de Last.fm.');
      return;
    }

    setCargando(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/lastfm/stats`, {
        params: { username: usuario.trim() },
      });
      setDatos(response.data);
      localStorage.setItem('rewind:lastfmUser', usuario.trim());
      localStorage.setItem('rewind:lastfmStats', JSON.stringify(response.data));
      const token = localStorage.getItem('rewind:token');
      if (!token) {
        setError('Estadísticas cargadas. Inicia sesión para guardar este usuario en tu cuenta.');
        return;
      }
      try {
        await axios.put(`${API_URL}/api/auth/lastfm`, { username: usuario.trim() }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (associationError) {
        if (associationError.response?.status === 401) {
          localStorage.removeItem('rewind:token');
          localStorage.removeItem('rewind:user');
          setError('Estadísticas cargadas. Tu sesión expiró; inicia sesión para guardar el vínculo.');
        } else {
          setError(associationError.response?.data?.error || 'Estadísticas cargadas, pero no se pudo guardar el vínculo.');
        }
      }
    } catch (requestError) {
      setDatos(null);
      setError(requestError.response?.data?.error || 'No pudimos consultar Last.fm.');
    } finally {
      setCargando(false);
    }
  };

  const generos = datos?.generos || [];
  const artistas = datos?.artistas || [];

  return (
    <div>
      <div style={{ background: '#111', color: 'white', padding: '10px', fontSize: '0.8rem', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        SPOTIFY • YOUTUBE • TIDAL • SOUNDCLOUD • TU HISTORIAL • TU PRÓXIMO DIRECTO
      </div>

      <div className="detalle-grid" style={{ alignItems: 'start' }}>
        <div>
          <span style={{ background: 'var(--rewind-green)', padding: '5px 10px', border: 'var(--border-thick)' }}>CARA A - TU SONIDO</span>
          <h1 style={{ fontSize: '4rem', marginTop: '20px', lineHeight: '0.9' }}>TU MEZCLA<br/>PRINCIPAL</h1>
          <p style={{ margin: '20px 0' }}>Conecta tu usuario de Last.fm y convierte tu historial real en una cartelera hecha a tu medida.</p>
          <form onSubmit={consultarGustos} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="USUARIO DE LAST.FM"
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
              aria-label="Usuario de Last.fm"
              style={{ flex: '1 1 220px', marginBottom: 0, border: 'var(--border-thick)' }}
            />
            <button type="submit" className="retro-btn" disabled={cargando} style={{ background: 'var(--rewind-red)' }}>
              {cargando ? 'LEYENDO...' : 'VER MIS GUSTOS'}
            </button>
          </form>
          {error && <p role="alert" style={{ marginTop: '14px', color: '#b00020', fontWeight: 'bold' }}>{error}</p>}
        </div>

        <div className="retro-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
            <h2>FRECUENCIAS FAVORITAS</h2>
            <span>{datos ? `${datos.totalReproducciones.toLocaleString()} SCROBBLES` : 'LAST.FM'}</span>
          </div>

          {!datos && !cargando && <p>Busca tu usuario para convertir tus escuchas reales en frecuencias favoritas.</p>}
          {cargando && <p>LEYENDO TU HISTORIAL MUSICAL...</p>}
          {generos.map((stat, index) => (
            <div key={stat.nombre}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <span>{stat.nombre}</span>
                <span>{stat.porcentaje}%</span>
              </div>
              <div className="progress-container">
                <div className="progress-fill" style={{ width: `${stat.porcentaje}%`, background: colores[index % colores.length] }}></div>
              </div>
            </div>
          ))}

          <div style={{ borderTop: '2px dashed #ccc', margin: '20px 0', padding: '20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {artistas.map((artist) => (
              <span key={artist.nombre} style={{ border: 'var(--border-thick)', padding: '5px 10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {artist.nombre} ({artist.reproducciones.toLocaleString()})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}