import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const [conciertosOriginales, setConciertosOriginales] = useState([]);
  const [conciertosVisibles, setConciertosVisibles] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [usuarioLastfm, setUsuarioLastfm] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const center = [19.4326, -99.1332];

  useEffect(() => {
    cargarConciertos();
  }, []);

  // Cargar desde Ticketmaster
  const cargarConciertos = async (filtro = '') => {
    setCargando(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/conciertos?keyword=${filtro}`);
      setConciertosOriginales(response.data);
      setConciertosVisibles(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
    setCargando(false);
  };

  // Filtrado manual por texto
  const manejarBusqueda = (e) => {
    e.preventDefault();
    cargarConciertos(busqueda);
  };

  // Filtrado mágico con Last.fm
  const filtrarPorLastfm = async (e) => {
    e.preventDefault();
    if (!usuarioLastfm) return alert("Ingresa un usuario de Last.fm");
    
    setCargando(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/lastfm/mis-artistas?username=${usuarioLastfm}`);
      const misArtistas = res.data;
      alert(`Analizando tus gustos musicales... Top bandas encontradas:\n${misArtistas.slice(0, 5).join(', ')}...`);
      
      const filtrados = conciertosOriginales.filter(c => 
        misArtistas.some(artista => c.artista.toLowerCase().includes(artista.toLowerCase()))
      );
      
      setConciertosVisibles(filtrados);
      if(filtrados.length === 0) alert("No encontramos conciertos cercanos de tus bandas favoritas. Intenta quitar los filtros.");
    } catch (error) {
      alert("No se encontró el usuario de Last.fm o hubo un error.");
    }
    setCargando(false);
  };

  return (
    <div className="app-container">
      {/* MENÚ LATERAL */}
      <div className="sidebar">
        <h2>🎵 Concert Finder</h2>
        
        {/* Buscador General */}
        <div className="filter-section">
          <h3>Búsqueda General</h3>
          <form onSubmit={manejarBusqueda}>
            <input 
              type="text" 
              placeholder="Artista, género o recinto..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <div className="botones-fila">
              <button type="submit" className="btn-primary">Buscar</button>
              <button type="button" className="btn-secondary" onClick={() => { setBusqueda(''); cargarConciertos(''); }}>Ver Todos</button>
            </div>
          </form>
        </div>

        {/* Recomendador Last.fm */}
        <div className="filter-section lastfm-section">
          <h3>✨ Recomendaciones Last.fm</h3>
          <p>Usa tu historial musical para filtrar</p>
          <form onSubmit={filtrarPorLastfm}>
            <input 
              type="text" 
              placeholder="Tu usuario de Last.fm" 
              value={usuarioLastfm}
              onChange={(e) => setUsuarioLastfm(e.target.value)}
            />
            <button type="submit" className="btn-lastfm" disabled={cargando}>
              {cargando ? 'Cargando...' : 'Filtrar por mis gustos'}
            </button>
          </form>
        </div>

        {/* Lista de Conciertos */}
        <div className="lista-conciertos">
          <h3>Conciertos Encontrados ({conciertosVisibles.length})</h3>
          {conciertosVisibles.map(c => (
            <div key={c.id} className="concierto-card">
              <h4>{c.artista}</h4>
              <p>📍 {c.recinto}</p>
              <p>🗺️ {c.direccion}</p>
              <p>🏷️ Género: {c.genero}</p>
              <p>💵 Precio: {c.precio}</p>
              <a href={c.url} target="_blank" rel="noreferrer">Ver Boletos</a>
            </div>
          ))}
        </div>
      </div>

      {/* ÁREA DEL MAPA */}
      <div className="map-container">
        <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          {conciertosVisibles.map((concierto) => (
            <Marker key={concierto.id} position={[concierto.lat, concierto.lng]}>
              <Popup>
                <strong>{concierto.artista}</strong> <br/>
                💵 {concierto.precio} <br/>
                📍 {concierto.recinto}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;