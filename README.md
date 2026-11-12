# Rewind Concert Finder

Aplicación web para descubrir conciertos, consultar sus ubicaciones en un mapa y ordenar la cartelera según los gustos musicales del usuario.

El proyecto forma parte de la materia **Ingeniería en Software**.


## Características

- Consulta de eventos musicales mediante Ticketmaster Discovery API.
- Catálogo de eventos musicales de México con paginación completa de Ticketmaster.
- Búsqueda por artista, recinto o ciudad.
- Filtros por próximos eventos, año completo y fechas personalizadas.
- Filtro **Cerca de mí** mediante geolocalización del navegador.
- Mapa interactivo con React Leaflet y OpenStreetMap.
- Registro e inicio de sesión con cuentas persistentes.
- Contraseñas almacenadas con hash `bcrypt`.
- Sesiones autenticadas mediante JWT.
- Inicio de sesión con Spotify OAuth.
- Consulta de estadísticas reales de Last.fm.
- Asociación persistente de la cuenta de Last.fm con la cuenta de Rewind.
- Porcentaje de afinidad de `0%` a `100%` cuando existen gustos guardados.
- Ordenamiento de conciertos de mayor a menor afinidad.
- Enlaces externos para consultar o comprar boletos.

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| React | Interfaz web y componentes |
| Vite | Desarrollo y compilación del frontend |
| React Router | Navegación entre vistas |
| Axios | Peticiones HTTP |
| Node.js | Entorno del backend |
| Express | Servidor y API REST |
| bcrypt | Hash seguro de contraseñas |
| JSON Web Token | Autenticación de sesiones |
| Leaflet / React Leaflet | Mapa interactivo |
| OpenStreetMap | Capas cartográficas |
| Ticketmaster Discovery API | Eventos musicales |
| Last.fm API | Artistas, reproducciones y géneros |
| Spotify Web API | Inicio de sesión mediante OAuth |
| Docker Compose | Ejecución coordinada de frontend y backend |

## Estructura

```text
.
├── README.md
└── src/
    └── concert-finder/
        ├── docker-compose.yml
        ├── backend/
        │   ├── Dockerfile
        │   ├── index.js
        │   ├── package.json
        │   ├── .env                  # Solo local
        │   └── data/
        │       ├── gustos-db.json    # Gustos de Last.fm por usuario
        │       └── usuarios-db.json  # Cuentas y vínculos de Last.fm
        └── frontend/
            ├── Dockerfile
            ├── package.json
            ├── index.html
            └── src/
                ├── AppRouter.jsx
                ├── Conciertos.jsx
                ├── ConciertoDetalle.jsx
                ├── Login.jsx
                ├── MisGustos.jsx
                ├── SpotifyCallback.jsx
                ├── App.css
                └── index.css
```

Los archivos de datos locales están excluidos de Git. En producción se recomienda reemplazarlos por una base de datos administrada.

## Requisitos

- Docker Engine.
- Docker Compose.
- Node.js 20 o superior para ejecutar el proyecto fuera de Docker.
- Claves de Ticketmaster, Last.fm y Spotify.

## Variables de entorno

Crea `src/concert-finder/backend/.env` con tus propias credenciales:

```dotenv
PORT=3000
JWT_SECRET=una-clave-larga-y-segura
FRONTEND_URL=http://localhost:5173

TICKETMASTER_API_KEY=tu_clave_de_ticketmaster
LASTFM_API_KEY=tu_clave_de_lastfm

SPOTIFY_CLIENT_ID=tu_client_id_de_spotify
SPOTIFY_CLIENT_SECRET=tu_client_secret_de_spotify
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/spotify/callback
```

No subas `.env`, contraseñas, tokens ni los archivos de `backend/data/` al repositorio.

En Spotify Developer registra exactamente esta URL de redirección:

```text
http://127.0.0.1:3000/api/spotify/callback
```

## Ejecución con Docker

Desde la carpeta del proyecto:

```bash
cd src/concert-finder
sudo docker compose up --build
```

Direcciones disponibles:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)
- Salud del backend: [http://localhost:3000/api/health](http://localhost:3000/api/health)

Para detener los servicios:

```bash
sudo docker compose down
```

Los datos de cuentas y gustos se conservan en `backend/data/` mediante el volumen montado por Compose.

## Ejecución local sin Docker

### Backend

```bash
cd src/concert-finder/backend
npm install
node index.js
```

### Frontend

En otra terminal:

```bash
cd src/concert-finder/frontend
npm install
npm run dev -- --host
```

## Rutas del frontend

| Ruta | Descripción |
| --- | --- |
| `/` | Registro e inicio de sesión |
| `/oauth/spotify` | Callback de autenticación de Spotify |
| `/stats` | Gustos y estadísticas de Last.fm |
| `/conciertos` | Cartelera, búsqueda, afinidad y filtros |
| `/concierto/:id` | Detalle y mapa de un concierto |

## API principal

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/api/health` | Estado del backend |
| `GET` | `/api/conciertos` | Eventos musicales de Ticketmaster México |
| `GET` | `/api/conciertos/:id` | Detalle de un evento |
| `POST` | `/api/auth/register` | Crear una cuenta |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET` | `/api/auth/me` | Consultar la cuenta autenticada |
| `PUT` | `/api/auth/lastfm` | Asociar un usuario de Last.fm |
| `GET` | `/api/lastfm/stats?username=...` | Obtener y guardar estadísticas de Last.fm |
| `GET` | `/api/gustos/:username` | Recuperar gustos guardados |
| `GET` | `/auth/spotify` | Iniciar OAuth de Spotify |
| `POST` | `/api/auth/spotify/exchange` | Intercambiar el código temporal de Spotify |

Las rutas protegidas requieren:

```http
Authorization: Bearer <token>
```

## Flujo de usuario

1. El usuario crea una cuenta o inicia sesión.
2. También puede autenticarse directamente con Spotify.
3. En **Mis gustos**, introduce su usuario de Last.fm.
4. Rewind consulta artistas, reproducciones y géneros.
5. El usuario de Last.fm queda vinculado a su cuenta.
6. En **Conciertos**, el vínculo se recupera automáticamente.
7. Los eventos muestran una afinidad entre `0%` y `100%` cuando hay gustos guardados.
8. **Cerca de mí** solicita permiso de ubicación y filtra eventos en un radio de 50 km.

La geolocalización requiere permiso del navegador. `localhost` es válido para desarrollo; en producción se necesita HTTPS.

## Comprobaciones útiles

Frontend:

```bash
cd src/concert-finder/frontend
npm run lint
npm run build
```

Backend:

```bash
node --check src/concert-finder/backend/index.js
```

Salud del backend:

```bash
curl http://localhost:3000/api/health
```

## Seguridad

- Las claves de API solo se leen en el backend.
- Las contraseñas nunca se almacenan en texto plano.
- Las sesiones utilizan JWT firmado.
- Spotify utiliza `state` firmado y códigos temporales de un solo uso.
- `.env`, cuentas locales y gustos personales están excluidos de Git.
- Para producción se recomienda HTTPS, una base de datos real, rotación de secretos y cookies `HttpOnly` para las sesiones.

## Objetivo

Rewind conecta los gustos musicales personales con conciertos reales disponibles, para que descubrir un próximo evento sea rápido, visual y relevante para cada usuario.
