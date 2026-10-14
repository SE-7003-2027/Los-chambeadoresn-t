import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const [conciertos, setConciertos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tokenSpotify, setTokenSpotify] = useState(null);
  
  const center = [19.4326, -99.1332];

  // 1. Cargar conciertos al inicio y verificar si venimos de Spotify
  useEffect(() => {
    cargarConciertos(); // Carga todo por defecto

    // Revisar si hay un token en la URL (cuando Spotify nos redirige)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setTokenSpotify(token);
      // Limpiar la URL para que no se vea el token feo
      window.history.replaceState({}, document.title, "/"); 
    }
  }, []);

  // 2. Función para pedir conciertos a Ticketmaster (con o sin filtro)
  const cargarConciertos = (filtro = '') => {
    axios.get(`http://localhost:3000/api/conciertos?keyword=${filtro}`)
      .then(response => setConciertos(response.data))
      .catch(error => console.error("Error:", error));
  };

  // 3. Manejar la búsqueda manual
  const manejarBusqueda = (e) => {
    e.preventDefault();
    cargarConciertos(busqueda);
  };

  // 4. Conectar a Spotify
  const loginSpotify = () => {
    window.location.href = 'http://localhost:3000/api/spotify/login';
  };

  // 5. Filtrar por gustos usando el token
  const filtrarPorMisGustos = async () => {
    if (!tokenSpotify) return;
    try {
      // Pedimos los artistas top al backend
      const res = await axios.get('http://localhost:3000/api/spotify/mis-artistas', {
        headers: { Authorization: tokenSpotify }
      });
      const misArtistas = res.data;
      alert(`Buscando conciertos de: ${misArtistas.join(', ')}`);
      
      // Filtramos los conciertos que ya tenemos cargados
      setConciertos(prevConciertos => 
        prevConciertos.filter(c => 
          misArtistas.some(artista => c.artista.toLowerCase().includes(artista.toLowerCase()))
        )
      );
    } catch (error) {
      console.error("Error buscando gustos", error);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw", display: 'flex', flexDirection: 'column' }}>
      
      {/* BARRA DE HERRAMIENTAS SUPERIOR */}
      <div style={{ padding: '15px', background: '#222', color: 'white', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>🎵 Concert Finder</h2>
        
        <form onSubmit={manejarBusqueda} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Ej. Rock, Pop, Metallica..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button type="submit">Buscar</button>
          <button type="button" onClick={() => cargarConciertos('')}>Ver Todos</button>
        </form>

        <div style={{ marginLeft: 'auto' }}>
          {!tokenSpotify ? (
            <button onClick={loginSpotify} style={{ background: '#1DB954', color: 'white', border: 'none', padding: '10px', borderRadius: '20px', cursor: 'pointer' }}>
              Conectar con Spotify
            </button>
          ) : (
            <button onClick={filtrarPorMisGustos} style={{ background: '#8A2BE2', color: 'white', border: 'none', padding: '10px', borderRadius: '20px', cursor: 'pointer' }}>
              ✨ Recomiéndame conciertos
            </button>
          )}
        </div>
      </div>

      {/* MAPA */}
      <MapContainer center={center} zoom={12} style={{ flexGrow: 1, width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {conciertos.map((concierto) => (
          <Marker key={concierto.id} position={[concierto.lat, concierto.lng]}>
            <Popup>
              <strong>{concierto.artista}</strong> <br /> 
              📍 {concierto.recinto} <br />
              <a href={concierto.url} target="_blank" rel="noreferrer">Comprar Boletos</a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;