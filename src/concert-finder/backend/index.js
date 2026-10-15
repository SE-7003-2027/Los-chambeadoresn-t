require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

// --- 1. RUTA DE TICKETMASTER ---
app.get('/api/conciertos', async (req, res) => {
  try {
    const API_KEY = process.env.TICKETMASTER_API_KEY;
    const latlong = "19.4326,-99.1332"; // CDMX por defecto
    const keyword = req.query.keyword || ''; 
    
    // Pedimos 50 eventos para tener de dónde filtrar
    let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&latlong=${latlong}&radius=50&unit=km&segmentName=Music&size=50`;
    
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }

    const response = await axios.get(url);
    const eventos = response.data._embedded?.events || [];
    
    const conciertos = eventos.map(evento => {
      const venue = evento._embedded?.venues?.[0];
      const location = venue?.location;
      
      // 1. Extraemos el precio oficial si existe
      const priceObj = evento.priceRanges?.[0];
      let precio;
      
      if (priceObj) {
        precio = `$${priceObj.min} - $${priceObj.max} ${priceObj.currency}`;
      } else {
        // 2. Si no hay precio, generamos un estimado realista
        // Precio mínimo entre \$400 y \$900
        const precioMin = Math.floor(Math.random() * 500) + 400; 
        // Precio máximo entre \$1500 y \$3500
        const precioMax = Math.floor(Math.random() * 2000) + 1500; 
        precio = `Estimado: $${precioMin} - $${precioMax} MXN`;
      }

      const direccion = venue?.address?.line1 || "Dirección desconocida";
      const genero = evento.classifications?.[0]?.genre?.name || "Desconocido";

      return {
        id: evento.id,
        artista: evento.name,
        recinto: venue?.name || "Ubicación desconocida",
        direccion: direccion,
        precio: precio,
        genero: genero,
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

// --- 2. RUTA DE LAST.FM (Sin OAuth, directo y fácil) ---
app.get('/api/lastfm/mis-artistas', async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "Falta el nombre de usuario" });

  try {
    const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&api_key=${LASTFM_API_KEY}&format=json&limit=20`;
    
    const response = await axios.get(url);
    if (response.data.error) {
      return res.status(404).json({ error: "Usuario de Last.fm no encontrado" });
    }
    
    // Extraemos los nombres de las bandas más escuchadas
    const artistas = response.data.topartists.artist.map(a => a.name);
    res.json(artistas);
  } catch (error) {
    console.error("Error obteniendo artistas de Last.fm:", error.message);
    res.status(500).json({ error: "Error al consultar Last.fm" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en el puerto ${PORT}`);
});