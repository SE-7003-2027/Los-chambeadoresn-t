require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
// Permite que el frontend se comunique con este backend
app.use(cors()); 

// Ruta de prueba para enviar conciertos
app.get('/api/conciertos', (req, res) => {
  // Más adelante, aquí haremos la petición real a Ticketmaster, sigan viendo xd
  const conciertosMock = [
    { id: 1, artista: "Coldplay", recinto: "Foro Sol", lat: 19.404, lng: -99.094 },
    { id: 2, artista: "Dua Lipa", recinto: "Palacio de los Deportes", lat: 19.406, lng: -99.099 }
  ];
  res.json(conciertosMock);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});