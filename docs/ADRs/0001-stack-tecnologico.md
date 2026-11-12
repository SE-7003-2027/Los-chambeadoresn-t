# ADR 0001: Stack tecnológico

- **Estado:** Aceptado
- **Fecha:** 2026-11-11
- **Decisores:** Equipo de Rewind Concert Finder

## Contexto

Rewind necesita una interfaz web interactiva para consultar conciertos, aplicar filtros, mostrar mapas y presentar recomendaciones personalizadas. También requiere un backend pequeño que proteja las claves de Ticketmaster, Last.fm y Spotify, gestione autenticación y coordine las consultas a servicios externos.

El stack debe ser sencillo de ejecutar para el equipo, compatible con Docker Compose y adecuado para una aplicación JavaScript de alcance académico.

## Decisión

Se utilizará el siguiente stack:

- **React** para construir la interfaz por componentes y manejar estados como búsqueda, filtros, sesión, gustos y afinidad.
- **Vite** para el servidor de desarrollo rápido, HMR y compilación del frontend.
- **Leaflet con React Leaflet** para el mapa interactivo y sus marcadores.
- **Node.js con Express** para la API backend y la integración segura con servicios externos.
- **Docker Compose** para ejecutar frontend y backend con una configuración reproducible.

## Motivos

### React frente a alternativas

React permite dividir la aplicación en vistas reutilizables como login, gustos, cartelera y detalle de concierto. Su ecosistema cubre routing, mapas y peticiones HTTP sin imponer una estructura de backend adicional. Frente a una solución basada únicamente en JavaScript del navegador, React facilita el manejo de estados y la actualización de la afinidad y los filtros.

### Vite frente a alternativas

Vite ofrece un arranque rápido y una configuración pequeña para un proyecto React. Es adecuado para desarrollo local porque proporciona HMR y una compilación de producción directa. Frente a configuraciones manuales con Webpack, reduce la configuración que el equipo debe mantener.

### Leaflet frente a alternativas

Leaflet es una biblioteca ligera, madura y compatible con OpenStreetMap. React Leaflet permite integrar el mapa respetando el modelo de componentes de React. Frente a soluciones comerciales como Google Maps, evita depender de una plataforma propietaria adicional para la visualización básica de ubicaciones.

## Consecuencias positivas

- Desarrollo rápido y curva de aprendizaje razonable.
- Separación clara entre frontend y backend.
- Integración sencilla con las APIs externas del proyecto.
- Mapa interactivo sin coste de licencia para la capa cartográfica básica.
- Ejecución reproducible mediante Docker Compose.

## Consecuencias y limitaciones

- Leaflet requiere cuidar la carga de CSS, iconos y coordenadas válidas.
- OpenStreetMap tiene políticas de uso que deben respetarse en producción.
- La persistencia local en archivos JSON es suficiente para desarrollo académico, pero debe sustituirse por una base de datos administrada para múltiples instancias o producción.
- React y Vite no resuelven por sí mismos autenticación, seguridad o persistencia; esas responsabilidades quedan en el backend.

## Alternativas consideradas

- **Next.js:** ofrece frontend y backend integrados, pero añade una estructura y complejidad que no son necesarias para el alcance actual.
- **Vue:** sería viable para la interfaz, pero el equipo ya trabaja con React y su ecosistema cubre las necesidades del proyecto.
- **Google Maps:** ofrece funcionalidades avanzadas, pero introduce credenciales, cuotas y dependencia de un proveedor comercial para el mapa.
- **Mapbox:** ofrece mapas personalizables, pero requiere una cuenta y configuración adicional que no aporta valor esencial para esta versión.

## Revisión

Esta decisión debe revisarse si el proyecto necesita despliegue productivo, múltiples instancias del backend, mayor volumen de usuarios o funcionalidades avanzadas de mapas y geolocalización.
