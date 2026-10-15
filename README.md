# Los-chambeadoresn-t

# Proyecto de Ingenieria en Software:

## 👥 Datos Generales


* **Materia:** Ingenieria en Software
* **Profesor/a:** Marisol Amezcua López
* **Profesor/a:** Eric Toporek Coca
* **Profesor/a:** Rubén Ruiz Marrón

### Integrantes
* **[Nombre]** - [No cuenta / Correo]
* **[Nombre]** - [No cuenta / Correo]
* **Gustavo Angel Ortíz Vásquez** - [318231574 / gustavo008@ciencias.unam.mx]
* **Naomi Mociño** - [No cuenta / Correo]
* **Hazel Torres Nava** - [319158496 / hazelt@ciencias.unam.mx]


# 🎵 Concert Finder

**Concert Finder** es una aplicación web que permite consultar conciertos musicales y visualizar sus ubicaciones en un mapa interactivo. El proyecto está desarrollado en JavaScript, utilizando React para la interfaz y Node.js con Express para el servidor.

El objetivo es facilitar la búsqueda de eventos musicales mediante una representación geográfica, mostrando información de los conciertos disponibles y permitiendo que el usuario consulte sus ubicaciones y accesos externos.

Actualmente, el proyecto utiliza la **Ticketmaster Discovery API** para obtener información de los eventos y **OpenStreetMap** para mostrar el mapa. Además, integra la **API de Last.fm** para ofrecer recomendaciones personalizadas basadas en los gustos musicales del usuario.

## 📌 Características principales

- **Mapa interactivo y diseño responsivo:** visualización de las ubicaciones mediante marcadores dentro de una interfaz adaptable a computadoras y dispositivos móviles.
- **Filtro inteligente con Last.fm:** sistema de recomendaciones que utiliza los artistas más escuchados del usuario en Last.fm para identificar conciertos relacionados con sus gustos musicales.
- **Búsqueda general:** barra de búsqueda manual para buscar eventos por artista, género o recinto.
- **Información detallada de eventos:** las tarjetas y los marcadores muestran información como el artista, la dirección del recinto, el género musical y el precio cuando está disponible.
- **Acceso a eventos:** enlaces externos para consultar información adicional sobre los conciertos.
- **Arquitectura cliente-servidor:** separación entre la interfaz web y el backend, que gestiona las consultas a las API externas.

> Nota: si el precio oficial no está disponible y se muestra un estimado, debe identificarse claramente como una estimación y no como un precio confirmado por el organizador.

## 🛠️ Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| JavaScript | Lenguaje principal del proyecto. |
| React | Desarrollo de la interfaz de usuario y gestión de estados con `useState` y `useEffect`. |
| Vite | Herramienta para ejecutar y desarrollar el frontend. |
| Node.js | Entorno de ejecución del backend. |
| Express | Creación del servidor y de los endpoints de la aplicación, como `/api/conciertos` y `/api/lastfm/mis-artistas`. |
| Axios | Realización de peticiones HTTP desde el frontend y el backend. |
| React Leaflet | Integración del mapa interactivo con React. |
| Leaflet | Biblioteca para la creación de mapas interactivos. |
| OpenStreetMap | Proveedor de los datos cartográficos utilizados en el mapa. |
| Ticketmaster Discovery API | Fuente de información de los eventos musicales. |
| Last.fm API | Obtención de información sobre los artistas más escuchados y generación de recomendaciones musicales. |
| dotenv | Administración de variables de entorno y claves de las API. |
| CORS | Configuración de solicitudes entre el frontend y el backend. |
| Docker / Docker Compose | Contenerización y estandarización del entorno de desarrollo. |

## 📁 Estructura del proyecto

El repositorio se organiza en dos componentes principales, junto con los archivos de configuración de contenedores y control de versiones.

```text
concert-finder/
├── backend/
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env                  # Configuración local; no se sube a Git
│
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── index.html
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## ⚙️ Requisitos previos

Antes de instalar y ejecutar el proyecto, es necesario contar con las siguientes herramientas:

- **Node.js:** versión LTS compatible; se recomienda la versión 20 o superior.
- **npm:** gestor de paquetes que se instala junto con Node.js.
- **Git:** para clonar el repositorio.
- **Docker y Docker Compose:** recomendados para ejecutar el proyecto en un entorno estandarizado.
- **Ticketmaster Developer API Key:** necesaria para consultar eventos musicales.
- **Last.fm API Key:** necesaria para obtener información musical y generar recomendaciones.

## 📥 Instalación y configuración

### 1. Clonar el repositorio

Abre una terminal y ejecuta los siguientes comandos:

```bash
git clone <URL_DEL_REPOSITORIO>
cd concert-finder
```

Sustituye `<URL_DEL_REPOSITORIO>` por la dirección real del repositorio.

### 2. Configurar las variables de entorno

Para proteger las credenciales y evitar subirlas a GitHub, crea un archivo llamado `.env` dentro de la carpeta `backend/`.

El archivo `backend/.env` debe contener la siguiente estructura:

```dotenv
TICKETMASTER_API_KEY=tu_clave_de_ticketmaster
LASTFM_API_KEY=tu_clave_de_lastfm
PORT=3000
```

Sustituye los valores de ejemplo por tus propias claves de API.

### 3. Configurar `.gitignore`

Verifica que el archivo `.gitignore` incluya las siguientes entradas para excluir las dependencias, los archivos generados y las credenciales:

```gitignore
node_modules/
backend/node_modules/
frontend/node_modules/

.env
backend/.env
frontend/.env

dist/
```

**Importante:** no compartas ni subas las claves de las API al repositorio. El archivo `.env` debe permanecer local.

## 🚀 Ejecución del proyecto

La aplicación puede ejecutarse mediante Docker Compose o de forma local, sin Docker.

### Opción A. Ejecución mediante Docker Compose (recomendada)

Desde la raíz del proyecto (`concert-finder/`), ejecuta:

```bash
sudo docker compose up --build
```

Una vez iniciados los servicios, podrás acceder a las siguientes direcciones:

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend — API de conciertos:** [http://localhost:3000/api/conciertos](http://localhost:3000/api/conciertos)

Para detener los contenedores, presiona `Ctrl + C` o ejecuta el siguiente comando en otra terminal:

```bash
sudo docker compose down
```

### Opción B. Ejecución local tradicional (sin Docker)

Para ejecutar la aplicación manualmente, necesitarás dos terminales.

#### 1. Iniciar el backend

En la primera terminal, ejecuta:

```bash
cd backend
npm install
node index.js
```

El backend se ejecutará en el puerto `3000`, siempre que esa sea la configuración definida en el archivo `.env`.

#### 2. Iniciar el frontend

Abre una segunda terminal y ejecuta:

```bash
cd frontend
npm install
npm run dev -- --host
```

Una vez iniciado Vite, podrás acceder al frontend desde la dirección que indique la terminal, normalmente:

[http://localhost:5173](http://localhost:5173)

## 📋 Gestión del proyecto

La organización y el seguimiento de las tareas de desarrollo de Concert Finder se realizan mediante Trello. En el tablero se registran los objetivos, las funcionalidades pendientes y el progreso del proyecto.

- **Tablero de Trello:** [Concert Finder](https://trello.com/invite/b/6acebcf5829f8c3defdabc50/ATTI2bd7b5f077ba91566b30ecaf92799b2f1FD29EC7/concert-finder)

## 🎯 Objetivo general

Desarrollar una aplicación web que permita encontrar conciertos y eventos musicales de acuerdo con los gustos del usuario, utilizando información de sus artistas más escuchados y mostrando los resultados en un mapa interactivo.

## 🔮 Mejoras futuras

Entre las posibles mejoras del proyecto se encuentran:

- Incorporar filtros por fecha, género musical y ubicación.
- Mejorar la personalización de las recomendaciones.
- Permitir guardar conciertos favoritos.
- Ampliar las opciones para encontrar artistas similares.
- Mejorar la información disponible sobre precios, recintos y accesos a las entradas.
- Evaluar la integración con otras plataformas musicales, según las API y los permisos disponibles.
