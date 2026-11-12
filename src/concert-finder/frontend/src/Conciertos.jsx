import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Conciertos() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('proximos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [ubicacion, setUbicacion] = useState(null);
  const [solicitandoUbicacion, setSolicitandoUbicacion] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState('');
  const [gustos, setGustos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rewind:lastfmStats'));
    } catch {
      return null;
    }
  });
  const [usarGustos, setUsarGustos] = useState(() => {
    try {
      return Boolean(JSON.parse(localStorage.getItem('rewind:lastfmStats')));
    } catch {
      return false;
    }
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const colores = ['var(--rewind-red)', 'var(--rewind-blue)', 'var(--rewind-yellow)', 'var(--rewind-green)'];

  const cargarEventos = async (termino = '') => {
    setCargando(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/conciertos`, {
        params: termino ? { keyword: termino } : {},
      });
      setEventos(response.data);
    } catch {
      setError('No pudimos cargar la cartelera. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;

    const cargaInicial = window.setTimeout(() => {
      cargarEventos().catch(() => undefined);
    }, 0);

    const cargarGustosGuardados = async () => {
      if (gustos) return;
      let usuarioGuardado = localStorage.getItem('rewind:lastfmUser');
      const token = localStorage.getItem('rewind:token');

      if (!usuarioGuardado && token) {
        try {
          const cuenta = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          usuarioGuardado = cuenta.data.lastfmUsername;
        } catch {
          return;
        }
      }

      if (!usuarioGuardado) return;
      try {
        const response = await axios.get(`${API_URL}/api/gustos/${encodeURIComponent(usuarioGuardado)}`);
        if (activo) {
          setGustos(response.data);
          setUsarGustos(true);
          localStorage.setItem('rewind:lastfmUser', usuarioGuardado);
          localStorage.setItem('rewind:lastfmStats', JSON.stringify(response.data));
        }
      } catch {
        // La cartelera sigue disponible aunque aún no haya gustos guardados.
      }
    };

    cargarGustosGuardados();

    return () => {
      activo = false;
      window.clearTimeout(cargaInicial);
    };
  }, [gustos]);

  const eventosFiltrados = eventos
    .map((evento) => ({
      ...evento,
      afinidad: calcularAfinidad(evento, gustos),
      distancia: ubicacion ? calcularDistancia(ubicacion, evento) : null,
    }))
    .filter((evento) => coincideFecha(evento, filtroFecha, fechaDesde, fechaHasta, ubicacion))
    .sort((eventoA, eventoB) => {
      if (usarGustos) return eventoB.afinidad - eventoA.afinidad;
      if (filtroFecha === 'cercanos') return eventoA.distancia - eventoB.distancia;
      return 0;
    });

  const manejarBusqueda = (event) => {
    event.preventDefault();
    cargarEventos(busqueda.trim());
  };

  const activarGustos = () => {
    if (!gustos) {
      setError('Primero conecta tu usuario de Last.fm en MIS GUSTOS.');
      return;
    }
    setError('');
    setUsarGustos((activo) => !activo);
  };

  const activarUbicacion = () => {
    if (!navigator.geolocation) {
      setErrorUbicacion('Tu navegador no permite consultar la ubicación.');
      return;
    }

    setSolicitandoUbicacion(true);
    setErrorUbicacion('');
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setUbicacion({ lat: posicion.coords.latitude, lng: posicion.coords.longitude });
        setFiltroFecha('cercanos');
        setSolicitandoUbicacion(false);
      },
      () => {
        setErrorUbicacion('Permite el acceso a tu ubicación para encontrar conciertos cerca de ti.');
        setSolicitandoUbicacion(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  return (
    <div>
      <div className="hero-blue">
        <p>CARA B - AGENDA</p>
        <h1>DIRECTOS<br/>EN TU RADAR</h1>
      </div>

      <section className="controles-conciertos">
        <form className="buscador-conciertos" onSubmit={manejarBusqueda}>
          <input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="BUSCA ARTISTA, SALA O CIUDAD..."
            aria-label="Buscar conciertos"
          />
          <button type="submit" className="retro-btn">BUSCAR</button>
        </form>
        <div className="filtros-conciertos">
          {[
            ['proximos', 'PRÓXIMOS'],
            ['anio', 'TODO EL AÑO'],
          ].map(([valor, etiqueta]) => (
            <button key={valor} type="button" className={filtroFecha === valor ? 'filtro-activo' : ''} onClick={() => setFiltroFecha(valor)}>
              {etiqueta}
            </button>
          ))}
          <label>
            DESDE
            <input type="date" value={fechaDesde} onChange={(event) => { setFechaDesde(event.target.value); setFiltroFecha('personalizado'); }} />
          </label>
          <label>
            HASTA
            <input type="date" value={fechaHasta} onChange={(event) => { setFechaHasta(event.target.value); setFiltroFecha('personalizado'); }} />
          </label>
          <button type="button" className={filtroFecha === 'cercanos' ? 'filtro-activo' : ''} onClick={activarUbicacion} disabled={solicitandoUbicacion}>
            {solicitandoUbicacion ? 'BUSCANDO...' : 'CERCA DE MI'}
          </button>
          <button type="button" className={usarGustos ? 'gusto-activo' : ''} onClick={activarGustos}>
            {usarGustos ? 'GUSTOS ACTIVOS' : 'USAR MIS GUSTOS'}
          </button>
        </div>
      </section>

      <div className="grid-conciertos">
        {cargando && <p className="estado-conciertos">CARGANDO CARTELERA...</p>}
        {!cargando && error && <p className="estado-conciertos">{error}</p>}
        {!cargando && errorUbicacion && <p className="estado-conciertos">{errorUbicacion}</p>}
        {!cargando && !error && !eventosFiltrados.length && <p className="estado-conciertos">NO HAY CONCIERTOS PARA ESTE FILTRO.</p>}
        {eventosFiltrados.map((evento, index) => (
          <div key={evento.id} className="cinta-card" onClick={() => navigate(`/concierto/${evento.id}`)} role="button" tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && navigate(`/concierto/${evento.id}`)}>
            <div className="cinta-header" style={{ backgroundColor: colores[index % colores.length], color: index % colores.length === 1 ? 'white' : 'black' }}>
              <p style={{ fontSize: '0.8rem', borderBottom: '2px solid', paddingBottom: '5px' }}>LIVE SET - EDICIÓN LIMITADA</p>
              <h2 style={{ fontSize: '2.5rem', marginTop: '10px' }}>{evento.artista}</h2>
              <p>{evento.genero}</p>
              {gustos && <span className="badge-match" style={{ color: 'black' }}>{`${evento.afinidad}%`}</span>}
            </div>
            <div className="cinta-footer">
              <div><strong>{evento.fecha || 'FECHA POR CONFIRMAR'}</strong> | {evento.recinto}</div>
              <div>VER CINTA ➔</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}   

function coincideFecha(evento, filtro, desde, hasta, ubicacion) {
  if (filtro === 'cercanos') return Boolean(ubicacion && evento.distancia !== null && evento.distancia <= 50);
  if (!evento.fechaIso) return filtro === 'proximos' ? false : true;
  const fecha = new Date(evento.fechaIso);
  if (Number.isNaN(fecha.getTime())) return true;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (filtro === 'proximos') return fecha >= hoy;
  if (filtro === 'anio') return fecha.getFullYear() === hoy.getFullYear();
  if (filtro === 'personalizado') {
    const inicio = desde ? new Date(`${desde}T00:00:00`) : new Date('1970-01-01');
    const fin = hasta ? new Date(`${hasta}T23:59:59`) : new Date('2999-12-31');
    return fecha >= inicio && fecha <= fin;
  }
  return true;
}

function calcularDistancia(origen, evento) {
  if (!evento.lat || !evento.lng) return Number.POSITIVE_INFINITY;
  const radioTierraKm = 6371;
  const latOrigen = convertirRadianes(origen.lat);
  const latEvento = convertirRadianes(evento.lat);
  const diferenciaLatitud = convertirRadianes(evento.lat - origen.lat);
  const diferenciaLongitud = convertirRadianes(evento.lng - origen.lng);
  const a = Math.sin(diferenciaLatitud / 2) ** 2
    + Math.cos(latOrigen) * Math.cos(latEvento) * Math.sin(diferenciaLongitud / 2) ** 2;
  return radioTierraKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function convertirRadianes(grados) {
  return grados * (Math.PI / 180);
}

function calcularAfinidad(evento, gustos) {
  if (!gustos) return 0;
  const nombreEvento = evento.artista.toLowerCase();
  const generoEvento = evento.genero.toLowerCase();
  const artista = gustos.artistas?.find((item) => nombreEvento.includes(item.nombre.toLowerCase()) || item.nombre.toLowerCase().includes(nombreEvento));
  const genero = gustos.generos?.find((item) => generoEvento.includes(item.nombre.toLowerCase()) || item.nombre.toLowerCase().includes(generoEvento));
  const puntuacionArtista = artista ? Math.min(75, 35 + Math.round(artista.porcentaje * 0.4)) : 0;
  const puntuacionGenero = genero ? Math.min(25, Math.round(genero.porcentaje * 0.25)) : 0;
  return puntuacionArtista + puntuacionGenero;
}