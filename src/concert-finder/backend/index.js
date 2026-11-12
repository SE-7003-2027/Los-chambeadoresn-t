const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const gustosDbPath = path.join(__dirname, 'data', 'gustos-db.json');
const usuariosDbPath = path.join(__dirname, 'data', 'usuarios-db.json');
const spotifyAuthCodes = new Map();

app.use(cors());
app.use(express.json());

function autenticar(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Necesitas iniciar sesión' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET || 'secreto_rewind');
    return next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
}

app.get('/auth/spotify', (req, res) => {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
    return res.status(503).json({ error: 'Spotify no está configurado' });
  }

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: 'user-top-read user-read-recently-played',
    state: jwt.sign(
      { provider: 'spotify', nonce: crypto.randomUUID() },
      process.env.JWT_SECRET || 'secreto_rewind',
      { expiresIn: '10m' },
    ),
  });

  return res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get('/api/spotify/callback', async (req, res) => {
  const { code, error, state } = req.query;
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } = process.env;

  if (error || !code || !state) {
    return res.redirect(`${frontendUrl}/oauth/spotify?error=cancelled`);
  }

  try {
    const stateData = jwt.verify(state, process.env.JWT_SECRET || 'secreto_rewind');
    if (stateData.provider !== 'spotify') throw new Error('Estado OAuth inválido');

    const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }), {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 8000,
    });

    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
      timeout: 8000,
    });
    const profile = profileResponse.data;
    const usuarios = leerUsuarios();
    const email = String(profile.email || `spotify-${profile.id}@rewind.local`).toLowerCase();
    const usuarioExistente = Object.values(usuarios).find((usuario) => usuario.spotifyId === profile.id || usuario.email === email);
    const usuario = usuarioExistente || {
      id: crypto.randomUUID(),
      email,
      password: null,
      lastfmUsername: '',
      spotifyId: profile.id,
      provider: 'spotify',
      creadoEn: new Date().toISOString(),
    };
    usuario.spotifyId = profile.id;
    usuario.provider = usuario.provider || 'spotify';
    usuarios[usuario.email] = usuario;
    guardarUsuarios(usuarios);

    const exchangeCode = crypto.randomBytes(32).toString('hex');
    spotifyAuthCodes.set(exchangeCode, {
      token: crearSesion(usuario),
      expiraEn: Date.now() + 60_000,
    });
    return res.redirect(`${frontendUrl}/oauth/spotify?code=${exchangeCode}`);
  } catch (callbackError) {
    console.error('Spotify no disponible:', callbackError.message);
    return res.redirect(`${frontendUrl}/oauth/spotify?error=failed`);
  }
});

app.post('/api/auth/spotify/exchange', (req, res) => {
  const code = String(req.body.code || '');
  const authData = spotifyAuthCodes.get(code);
  spotifyAuthCodes.delete(code);

  if (!authData || authData.expiraEn < Date.now()) {
    return res.status(401).json({ error: 'El código de Spotify es inválido o expiró' });
  }
  return res.json(authData.token);
});

const conciertosDeRespaldo = [
  {
    id: 'demo-1',
    artista: 'Música en vivo',
    recinto: 'Foro Indie',
    direccion: 'Ciudad de México',
    genero: 'Alternativo',
    precio: 'Consultar disponibilidad',
    url: 'https://www.ticketmaster.com.mx/',
    fechaIso: '2026-12-19T20:00:00-06:00',
    fecha: '19 DIC 2026',
    lat: 19.4326,
    lng: -99.1332,
  },
];

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/conciertos', async (req, res) => {
  const keyword = String(req.query.keyword || '').trim();
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    return res.json(filtrarConciertosDeRespaldo(keyword));
  }

  try {
    const parametros = {
      apikey: apiKey,
      keyword: keyword || undefined,
      classificationName: 'Music',
      countryCode: 'MX',
      size: 200,
    };
    const primeraPagina = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
      params: { ...parametros, page: 0 },
      timeout: 12000,
    });
    const totalPaginas = primeraPagina.data?.page?.totalPages || 1;
    const eventos = primeraPagina.data?._embedded?.events || [];

    for (let pagina = 1; pagina < totalPaginas; pagina += 1) {
      const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
        params: { ...parametros, page: pagina },
        timeout: 12000,
      });
      eventos.push(...(response.data?._embedded?.events || []));
    }

    if (!eventos.length && !keyword) {
      return res.json(conciertosDeRespaldo);
    }
    return res.json(eventos.map(normalizarConcierto).filter(Boolean));
  } catch (error) {
    console.error('Ticketmaster no disponible:', error.message);
    return res.json(filtrarConciertosDeRespaldo(keyword));
  }
});

app.get('/api/gustos/:username', (req, res) => {
  const gustos = leerGustos()[normalizarUsuario(req.params.username)];
  return gustos ? res.json(gustos) : res.status(404).json({ error: 'No hay gustos guardados' });
});

app.get('/api/conciertos/:id', async (req, res) => {
  const { id } = req.params;
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (id === 'demo-1' || !apiKey) {
    const concierto = conciertosDeRespaldo.find((evento) => evento.id === id);
    return concierto ? res.json(concierto) : res.status(404).json({ error: 'Concierto no encontrado' });
  }

  try {
    const response = await axios.get(`https://app.ticketmaster.com/discovery/v2/events/${encodeURIComponent(id)}.json`, {
      params: { apikey: apiKey },
      timeout: 8000,
    });
    const concierto = normalizarConcierto(response.data);
    return concierto
      ? res.json(concierto)
      : res.status(404).json({ error: 'Concierto sin ubicación disponible' });
  } catch (error) {
    console.error('Detalle de Ticketmaster no disponible:', error.message);
    return res.status(502).json({ error: 'No se pudo consultar el concierto' });
  }
});

app.get('/api/lastfm/mis-artistas', async (req, res) => {
  const username = String(req.query.username || '').trim();
  const apiKey = process.env.LASTFM_API_KEY;

  if (!username || !apiKey) {
    return res.json([]);
  }

  try {
    const response = await axios.get('https://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'user.gettopartists',
        user: username,
        api_key: apiKey,
        format: 'json',
        limit: 50,
      },
      timeout: 8000,
    });

    const artistas = response.data?.topartists?.artist || [];
    return res.json(artistas.map((artista) => artista.name).filter(Boolean));
  } catch (error) {
    console.error('Last.fm no disponible:', error.message);
    return res.status(502).json({ error: 'No se pudo consultar Last.fm' });
  }
});

app.get('/api/lastfm/stats', async (req, res) => {
  const username = String(req.query.username || '').trim();
  const apiKey = process.env.LASTFM_API_KEY;

  if (!username || !apiKey) {
    return res.status(400).json({ error: 'Se necesita un usuario y una clave de Last.fm' });
  }

  try {
    const topArtistsResponse = await consultarLastfm('user.gettopartists', {
      user: username,
      limit: 10,
      period: 'overall',
    });
    const topArtists = topArtistsResponse.data?.topartists?.artist || [];

    if (!topArtists.length) {
      return res.status(404).json({ error: 'No encontramos gustos para ese usuario de Last.fm' });
    }

    const totalReproducciones = topArtists.reduce(
      (total, artist) => total + Number(artist.playcount || 0),
      0,
    );
    const artistas = topArtists.map((artist) => ({
      nombre: artist.name,
      reproducciones: Number(artist.playcount || 0),
      porcentaje: calcularPorcentaje(Number(artist.playcount || 0), totalReproducciones),
    }));

    const tagsPorArtista = await Promise.all(topArtists.slice(0, 8).map(async (artist) => {
      try {
        const response = await consultarLastfm('artist.gettoptags', {
          artist: artist.name,
          autocorrect: 1,
        });
        return {
          reproducciones: Number(artist.playcount || 0),
          tags: response.data?.toptags?.tag || [],
        };
      } catch {
        return { reproducciones: 0, tags: [] };
      }
    }));

    const pesoPorGenero = new Map();
    tagsPorArtista.forEach(({ reproducciones, tags }) => {
      tags.slice(0, 5).forEach((tag) => {
        const nombre = limpiarGenero(tag.name);
        if (nombre) {
          pesoPorGenero.set(nombre, (pesoPorGenero.get(nombre) || 0) + reproducciones);
        }
      });
    });

    const generosOrdenados = [...pesoPorGenero.entries()]
      .sort(([, pesoA], [, pesoB]) => pesoB - pesoA)
      .slice(0, 4);
    const maximoGenero = generosOrdenados[0]?.[1] || 1;
    const generos = generosOrdenados.map(([nombre, peso]) => ({
      nombre,
      porcentaje: Math.max(1, Math.round((peso / maximoGenero) * 100)),
    }));

    const gustos = {
      username,
      totalReproducciones,
      artistas,
      generos,
    };
    guardarGustos(gustos);
    return res.json(gustos);
  } catch (error) {
    console.error('Estadísticas de Last.fm no disponibles:', error.message);
    return res.status(502).json({ error: 'No se pudieron consultar las estadísticas de Last.fm' });
  }
});

function consultarLastfm(method, params) {
  return axios.get('https://ws.audioscrobbler.com/2.0/', {
    params: {
      method,
      ...params,
      api_key: process.env.LASTFM_API_KEY,
      format: 'json',
    },
    timeout: 8000,
  });
}

function calcularPorcentaje(valor, total) {
  return total ? Math.max(1, Math.round((valor / total) * 100)) : 0;
}

function limpiarGenero(nombre) {
  const genero = String(nombre || '').trim().toUpperCase();
  const generosIgnorados = ['SEEN LIVE', 'FAVORITES', 'FAVORITOS', 'ALL'];
  return genero && !generosIgnorados.includes(genero) ? genero : '';
}

function leerGustos() {
  try {
    return JSON.parse(fs.readFileSync(gustosDbPath, 'utf8'));
  } catch {
    return {};
  }
}

function guardarGustos(gustos) {
  fs.mkdirSync(path.dirname(gustosDbPath), { recursive: true });
  const existentes = leerGustos();
  existentes[normalizarUsuario(gustos.username)] = {
    ...gustos,
    actualizadoEn: new Date().toISOString(),
  };
  fs.writeFileSync(gustosDbPath, JSON.stringify(existentes, null, 2));
}

function normalizarUsuario(username) {
  return String(username || '').trim().toLowerCase();
}

function filtrarConciertosDeRespaldo(keyword) {
  if (!keyword) return conciertosDeRespaldo;
  const termino = keyword.toLowerCase();
  return conciertosDeRespaldo.filter((concierto) =>
    [concierto.artista, concierto.recinto, concierto.genero].some((campo) =>
      campo.toLowerCase().includes(termino),
    ),
  );
}

function normalizarConcierto(evento) {
  const venue = evento._embedded?.venues?.[0];
  const location = venue?.location;
  const artista = evento._embedded?.attractions?.[0]?.name || evento.name;
  if (!venue || !location) return null;

  return {
    id: evento.id,
    artista,
    recinto: venue.name || 'Recinto por confirmar',
    direccion: [venue.address?.line1, venue.city?.name].filter(Boolean).join(', '),
    genero: evento.classifications?.[0]?.genre?.name || 'Varios',
    precio: evento.priceRanges?.[0]
      ? `$${evento.priceRanges[0].min} - $${evento.priceRanges[0].max}`
      : 'Consultar disponibilidad',
    url: evento.url || 'https://www.ticketmaster.com.mx/',
    lat: Number(location.latitude),
    lng: Number(location.longitude),
    fechaIso: evento.dates?.start?.dateTime || evento.dates?.start?.localDate || null,
    fecha: formatearFecha(evento.dates?.start?.dateTime || evento.dates?.start?.localDate),
  };
}

function formatearFecha(fechaIso) {
  if (!fechaIso) return 'FECHA POR CONFIRMAR';
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return 'FECHA POR CONFIRMAR';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(fecha).toUpperCase();
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const usuarios = leerUsuarios();
    if (usuarios[email]) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    usuarios[email] = {
      id: crypto.randomUUID(),
      email,
      password: await bcrypt.hash(password, 10),
      lastfmUsername: '',
      creadoEn: new Date().toISOString(),
    };
    guardarUsuarios(usuarios);
    return res.status(201).json(crearSesion(usuarios[email]));
  } catch (error) {
    console.error('Error al registrar:', error.message);
    return res.status(500).json({ error: 'Error al registrar' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const usuario = leerUsuarios()[email];

  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }

  return res.json(crearSesion(usuario));
});

app.get('/api/auth/me', autenticar, (req, res) => {
  const usuario = leerUsuarios()[req.usuario.email];
  return usuario ? res.json(datosPublicosUsuario(usuario)) : res.status(404).json({ error: 'Cuenta no encontrada' });
});

app.put('/api/auth/lastfm', autenticar, async (req, res) => {
  const username = String(req.body.username || '').trim();
  if (!username) return res.status(400).json({ error: 'Escribe un usuario de Last.fm' });

  const usuarios = leerUsuarios();
  const usuario = usuarios[req.usuario.email];
  if (!usuario) return res.status(404).json({ error: 'Cuenta no encontrada' });

  try {
    await consultarLastfm('user.getinfo', { user: username });
    usuario.lastfmUsername = username;
    usuario.actualizadoEn = new Date().toISOString();
    usuarios[req.usuario.email] = usuario;
    guardarUsuarios(usuarios);
    return res.json(datosPublicosUsuario(usuario));
  } catch (error) {
    return res.status(404).json({ error: 'No encontramos ese usuario de Last.fm' });
  }
});

function leerUsuarios() {
  try {
    return JSON.parse(fs.readFileSync(usuariosDbPath, 'utf8'));
  } catch {
    return {};
  }
}

function guardarUsuarios(usuarios) {
  fs.mkdirSync(path.dirname(usuariosDbPath), { recursive: true });
  fs.writeFileSync(usuariosDbPath, JSON.stringify(usuarios, null, 2));
}

function datosPublicosUsuario(usuario) {
  return { id: usuario.id, email: usuario.email, lastfmUsername: usuario.lastfmUsername || '' };
}

function crearSesion(usuario) {
  return {
    token: jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET || 'secreto_rewind', { expiresIn: '7d' }),
    usuario: datosPublicosUsuario(usuario),
  };
}

app.listen(port, () => {
  console.log(`Backend escuchando en el puerto ${port}`);
});