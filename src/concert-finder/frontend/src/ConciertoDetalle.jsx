import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ConciertoDetalle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [concierto, setConcierto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    axios.get(`${API_URL}/api/conciertos/${encodeURIComponent(id)}`)
      .then((response) => {
        if (activo) setConcierto(response.data);
      })
      .catch(() => {
        if (activo) setError('No pudimos cargar este concierto.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [id]);

  const position = concierto ? [concierto.lat, concierto.lng] : [19.4326, -99.1332];

  return (
    <div>
      <div style={{ padding: '10px 20px', background: 'var(--rewind-yellow)', borderBottom: 'var(--border-thick)', cursor: 'pointer' }} onClick={() => navigate(-1)}>
        ← VOLVER A CONCIERTOS
      </div>

      <div className="detalle-grid">
        <div>
          <span style={{ background: 'var(--rewind-green)', padding: '5px 10px', border: 'var(--border-thick)' }}>LIVE SET - EDICIÓN LIMITADA</span>
          {cargando && <h1 style={{ fontSize: '4rem', marginTop: '20px', lineHeight: '0.9' }}>CARGANDO...</h1>}
          {error && <h1 style={{ fontSize: '3rem', marginTop: '20px', lineHeight: '0.9' }}>{error}</h1>}
          {concierto && <>
            <h1 style={{ fontSize: '5rem', marginTop: '20px', lineHeight: '0.9' }}>{concierto.artista}</h1>
            <p style={{ margin: '20px 0' }}>Encuentra todos los detalles y la ubicación de tu próximo concierto.</p>
          </>}
          
          <div className="info-box">
            <div className="info-cell"><strong>LUGAR</strong><br/>{concierto?.recinto || 'POR CONFIRMAR'}</div>
            <div className="info-cell"><strong>DIRECCIÓN</strong><br/>{concierto?.direccion || 'POR CONFIRMAR'}</div>
            <div className="info-cell"><strong>GÉNERO</strong><br/>{concierto?.genero || 'VARIOS'}</div>
            <div className="info-cell"><strong>PRECIO</strong><br/>{concierto?.precio || 'POR CONFIRMAR'}</div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <a className="retro-btn" style={{ background: 'var(--rewind-green)', color: 'black', textDecoration: 'none' }} href={concierto?.url} target="_blank" rel="noreferrer">COMPRAR BOLETOS ➔</a>
            <button className="retro-btn" style={{ background: 'var(--rewind-red)' }} type="button" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`, '_blank')}>VER CÓMO LLEGAR</button>
          </div>
        </div>

        {/* Gráfico de Casete (Placeholder visual) */}
        <div style={{ background: 'var(--rewind-blue)', border: 'var(--border-thick)', boxShadow: 'var(--shadow-solid)', padding: '40px', transform: 'rotate(2deg)' }}>
           <div style={{ background: 'white', border: 'var(--border-thick)', height: '200px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2>O --- O</h2>
           </div>
        </div>
      </div>

      {/* SECCIÓN DEL MAPA */}
      <div className="map-section">
        <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>CÓMO LLEGAR</h1>
        <div className="map-wrapper">
          <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position}>
              <Popup>{concierto?.artista || 'Concierto'} <br /> {concierto?.recinto || 'Ubicación por confirmar'}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}