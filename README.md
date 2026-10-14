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

Actualmente, el proyecto utiliza **Ticketmaster Discovery API** para obtener información de conciertos y **OpenStreetMap** para mostrar el mapa.

## 📌 Características principales

- **Mapa interactivo:** visualización de las ubicaciones de los conciertos mediante marcadores.
- **Consulta de eventos:** obtención de información de conciertos a través de Ticketmaster.
- **Información de los conciertos:** visualización del nombre del evento, el recinto y un enlace externo cuando está disponible.
- **Arquitectura cliente-servidor:** separación entre la interfaz web y el servidor que consulta la API externa.
- **Ubicación inicial:** el mapa comienza centrado en la Ciudad de México.
- **Preparación para futuras mejoras:** posibilidad de incorporar filtros por fecha y género musical, búsqueda por ubicación y otras funcionalidades.

## 🛠️ Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| JavaScript | Lenguaje principal del proyecto. |
| React | Desarrollo de la interfaz de usuario. |
| Vite | Herramienta para crear y ejecutar el frontend durante el desarrollo. |
| Node.js | Entorno de ejecución del backend. |
| Express | Creación del servidor y de los endpoints de la aplicación. |
| Axios | Realización de peticiones HTTP al backend y a Ticketmaster. |
| React Leaflet | Integración del mapa interactivo con React. |
| Leaflet | Biblioteca de mapas interactivos. |
| OpenStreetMap | Proveedor de los mapas utilizados en la interfaz. |
| Ticketmaster Discovery API | Fuente de información de los eventos musicales. |
| dotenv | Administración de variables de entorno y configuración de la API Key. |
| CORS | Permite las peticiones entre el frontend y el backend durante el desarrollo. |
| Docker / Docker Compose | Contenerización y estandarización del entorno de desarrollo del equipo. |

## 📁 Estructura del proyecto

El repositorio se organiza en dos componentes principales, junto con los archivos de configuración de contenedores y control de versiones:

```text
concert-finder/
├── backend/
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env                  # Se crea localmente (oculto en Git)
│
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
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

- **Node.js:** versión LTS compatible. Se recomienda la versión 20 o superior para el soporte de compilación.
- **npm:** gestor de paquetes que se instala junto con Node.js.
- **Git:** para clonar el repositorio.
- **Docker y Docker Compose:** herramientas recomendadas para estandarizar y ejecutar todo el entorno de manera aislada en cualquier sistema operativo.
- **Ticketmaster Developer API Key:** necesaria para consultar conciertos reales.

## 📥 Instalación y configuración

### 1. Clonar el repositorio

Abre una terminal y ejecuta los siguientes comandos:

```bash
git clone <URL_DEL_REPOSITORIO>
cd concert-finder
```

### 2. Configurar las variables de entorno (`.env`)

Para proteger las credenciales y evitar subirlas a GitHub, el archivo `.env` debe crearse localmente dentro de la carpeta `backend/`.

Crea el archivo `backend/.env` con la siguiente estructura:

```dotenv
TICKETMASTER_API_KEY=tu_clave_de_ticketmaster
PORT=3000
```

**Importante:** asegúrate de que el archivo `.gitignore` incluya la exclusión del archivo `.env` y las dependencias para mantener seguras tus claves:

```gitignore
node_modules/
backend/node_modules/
frontend/node_modules/
.env
backend/.env
dist/
```

## 🚀 Ejecución del proyecto

Puedes ejecutar la aplicación mediante Docker Compose —la opción recomendada para estandarizar el entorno de todo el equipo— o de forma local tradicional.

### Opción A: Ejecución mediante Docker Compose (recomendada)

Docker permite ejecutar el proyecto en un entorno estandarizado, sin necesidad de instalar las dependencias del proyecto manualmente en tu máquina.

Abre una terminal en la raíz del proyecto (`concert-finder/`) y ejecuta el siguiente comando para construir y levantar los contenedores:

```bash
sudo docker compose up --build
```

Una vez iniciados los servicios, podrás acceder a las siguientes direcciones:

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:3000/api/conciertos](http://localhost:3000/api/conciertos)

Para detener la ejecución, presiona `Ctrl + C` o ejecuta en otra terminal:

```bash
sudo docker compose down
```

### Opción B: Ejecución local tradicional (sin Docker)

Si prefieres ejecutar el proyecto manualmente, necesitarás dos terminales.

#### 1. Iniciar el backend

En la primera terminal, ejecuta:

```bash
cd backend
npm install
node index.js
```

El servidor del backend correrá en:

[http://localhost:3000](http://localhost:3000)

#### 2. Iniciar el frontend

Abre otra terminal e ingresa a la carpeta del frontend:

```bash
cd frontend
npm install
npm run dev -- --host
```

Una vez iniciado el frontend, podrás acceder a la aplicación desde la dirección local que indique Vite, normalmente:

[http://localhost:5173](http://localhost:5173)


## 📋 Gestión del proyecto

La organización y el seguimiento de las tareas de desarrollo de Concert Finder se realizan mediante Trello. En el tablero se registran los objetivos, las funcionalidades pendientes y el progreso del proyecto.

- **Tablero de Trello:** [Concert Finder](https://trello.com/invite/b/6acebcf5829f8c3defdabc50/ATTI2bd7b5f077ba91566b30ecaf92799b2f1FD29EC7/concert-finder)

