# Product Requirements Document

## 1. Resumen

Rewind Concert Finder es una aplicación web que ayuda a descubrir conciertos musicales relevantes para cada usuario. Consulta eventos de Ticketmaster, muestra sus ubicaciones en un mapa y utiliza los gustos musicales de Last.fm para calcular la afinidad con cada concierto.

## 2. Objetivos

- Facilitar la búsqueda de conciertos disponibles en México.
- Permitir filtrar eventos por texto, fecha y cercanía geográfica.
- Personalizar la cartelera con estadísticas reales de Last.fm.
- Asociar los gustos de Last.fm a la cuenta de Rewind para evitar consultas repetidas.
- Ofrecer registro, login y acceso con Spotify.
- Mantener una experiencia visual coherente con la identidad REWIND.

## 3. Público objetivo

- Personas que buscan conciertos próximos.
- Usuarios que quieren descubrir eventos relacionados con sus artistas favoritos.
- Personas que consultan carteleras desde dispositivos de escritorio o móviles.
- Usuarios de Last.fm o Spotify interesados en recomendaciones musicales.

## 4. Historias de usuario principales

### Cuenta y acceso

- Como usuario, quiero crear una cuenta con correo y contraseña para guardar mis preferencias.
- Como usuario registrado, quiero iniciar sesión y recuperar mi vínculo con Last.fm.
- Como usuario, quiero conectarme con Spotify mediante OAuth.

### Gustos musicales

- Como usuario, quiero introducir mi usuario de Last.fm para consultar mis artistas y géneros.
- Como usuario, quiero que mi usuario de Last.fm quede asociado a mi cuenta de Rewind.
- Como usuario, quiero conservar mis gustos entre sesiones.

### Conciertos

- Como usuario, quiero consultar los conciertos musicales disponibles.
- Como usuario, quiero buscar por artista, recinto o ciudad.
- Como usuario, quiero filtrar por próximos eventos, año o fechas personalizadas.
- Como usuario, quiero encontrar conciertos cerca de mi ubicación.
- Como usuario, quiero ver un porcentaje de afinidad entre mis gustos y cada concierto.
- Como usuario, quiero ordenar la cartelera de mayor a menor afinidad.
- Como usuario, quiero abrir el detalle del evento, su mapa y el enlace de boletos.

## 5. Alcance funcional

### Incluido

- Frontend React con Vite.
- Backend Node.js y Express.
- Ticketmaster Discovery API para eventos musicales de México.
- Last.fm API para artistas, reproducciones y géneros.
- Spotify OAuth para autenticación.
- JWT y bcrypt para autenticación de la aplicación.
- Persistencia local de usuarios y gustos en `backend/data/`.
- Mapa con React Leaflet y OpenStreetMap.
- Docker Compose para ejecutar frontend y backend.

### Fuera del alcance actual

- Compra directa de boletos dentro de Rewind.
- Base de datos administrada para producción.
- Sincronización completa de playlists de Spotify.
- Notificaciones push o correo electrónico.
- Panel administrativo.

## 6. Requisitos no funcionales

- Las claves de API deben permanecer en el backend.
- Las contraseñas no deben almacenarse en texto plano.
- La interfaz debe ser usable en escritorio y móvil.
- El proyecto debe poder ejecutarse mediante `docker compose up --build`.
- Los errores de APIs externas deben mostrarse sin bloquear toda la aplicación.

## 7. Criterios de éxito

- El usuario puede crear una cuenta e iniciar sesión.
- El usuario puede asociar Last.fm y recuperar el vínculo en una sesión posterior.
- La cartelera muestra eventos con fecha, ubicación y enlace externo.
- La afinidad se presenta entre `0%` y `100%` cuando existen gustos guardados.
- Los filtros de búsqueda, fecha y cercanía funcionan sin romper la vista.
- `npm run lint`, `npm run build` y Docker Compose completan correctamente.
