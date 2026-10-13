import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  // Estado para guardar los conciertos que lleguen del backend
  const [conciertos, setConciertos] = useState([]);
  
  // Coordenadas iniciales (Ciudad de México)
  const center = [19.4326, -99.1332];

  useEffect(() => {
    // Hacemos la petición a tu servidor local
    axios.get('http://localhost:3000/api/conciertos')
      .then(response => {
        setConciertos(response.data); // Guardamos los datos en el estado
      })
      .catch(error => {
        console.error("Error obteniendo los conciertos:", error);
      });
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <h2>🎵 Concert Finder</h2>
      
      <MapContainer center={center} zoom={12} style={{ height: "80%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {/* Recorremos el arreglo de conciertos y creamos un pin para cada uno */}
        {conciertos.map((concierto) => (
          <Marker key={concierto.id} position={[concierto.lat, concierto.lng]}>
            <Popup>
              <strong>{concierto.artista}</strong> <br /> {concierto.recinto}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;