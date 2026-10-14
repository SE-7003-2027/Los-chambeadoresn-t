require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
app.use(cors());

// --- 1. RUTA DE TICKETMASTER (Con soporte para filtros) ---
app.get('/api/conciertos', async (req, res) => {
  try {
    const API_KEY = process.env.TICKETMASTER_API_KEY;
    const latlong = "19.4326,-99.1332"; // CDMX por defecto
    const keyword = req.query.keyword || ''; // Recibe un filtro si el usuario lo envía
    
    let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&latlong=${latlong}&radius=50&unit=km&segmentName=Music`;
    
    // Si el usuario escribió algo en el buscador, lo agregamos a la petición
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }

    const response = await axios.get(url);
    const eventos = response.data._embedded?.events || [];
    
    const conciertos = eventos.map(evento => {
      const venue = evento._embedded?.venues?.[0];
      const location = venue?.location;
      return {
        id: evento.id,
        artista: evento.name,
        recinto: venue?.name || "Ubicación desconocida",
        lat: location ? parseFloat(location.latitude) : null,
        lng: location ? parseFloat(location.longitude) : null,
        url: evento.url
      };
    }).filter(c => c.lat !== null && c.lng !== null);

    res.json(conciertos);
  } catch (error) {
    console.error("Error consultando Ticketmaster:", error.message);
    res.status(500).json({ error: "Hubo un problema al buscar conciertos" });
  }
});

// --- 2. RUTAS DE AUTENTICACIÓN DE SPOTIFY ---
app.get('/api/spotify/login', (req, res) => {
  const authUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: 'user-top-read', // Permiso para leer historial
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    });
  res.redirect(authUrl);
});

app.get('/api/spotify/callback', async (req, res) => {
  const code = req.query.code || null;
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        grant_type: 'authorization_code'
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
      }
    });

    const accessToken = response.data.access_token;
    // Redirigimos al frontend pasándole el token
    res.redirect(`http://localhost:5173/?token=${accessToken}`);
  } catch (error) {
    console.error('Error Spotify:', error.message);
    res.send('Error en autenticación');
  }
});

// --- 3. RUTA PARA OBTENER TOP ARTISTAS ---
app.get('/api/spotify/mis-artistas', async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=15', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    // Extraemos solo los nombres de los artistas
    const nombresArtistas = response.data.items.map(a => a.name);
    res.json(nombresArtistas);
  } catch (error) {
    console.error("Error obteniendo artistas:", error.message);
    res.status(500).json({ error: "Error al consultar Spotify" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en el puerto ${PORT}`);
});