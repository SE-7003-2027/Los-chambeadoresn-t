# Guía de colaboración

## Requisitos

- Git.
- Docker y Docker Compose.
- Node.js 20 o superior para trabajar sin Docker.
- Un archivo `src/concert-finder/backend/.env` local con las claves necesarias.

Nunca incluyas claves, tokens, contraseñas ni archivos de datos personales en commits o issues.

## Clonar y preparar el proyecto

```bash
git clone <URL_DEL_REPOSITORIO>
cd Los-chambeadoresn-t
cd src/concert-finder
sudo docker compose up --build
```

Para trabajar sin Docker, instala dependencias dentro de `backend/` y `frontend/` por separado.

## Ramas

Usa ramas descriptivas basadas en el tipo de cambio:

```text
feature/nombre-corto
fix/nombre-del-error
refactor/nombre-del-cambio
docs/nombre-del-documento
```

Parte siempre de la rama principal actualizada:

```bash
git checkout main
git pull origin main
git checkout -b feature/mi-cambio
```

## Commits

Usa mensajes breves e imperativos. Ejemplos:

```text
feat: agregar filtro por cercanía
fix: corregir asociación de Last.fm
docs: actualizar instrucciones de Docker
```

## Validación antes de un PR

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

Si modificaste Docker:

```bash
cd src/concert-finder
sudo docker compose config
sudo docker compose up --build
```

## Pull requests

1. Actualiza tu rama con `main` antes de abrir el PR.
2. Describe el problema y la solución.
3. Indica qué comandos y escenarios probaste.
4. Incluye capturas o logs cuando el cambio sea visual o afecte una API.
5. Marca todos los puntos aplicables del checklist.
6. Solicita revisión a al menos un integrante del equipo.
7. Resuelve los comentarios y conflictos antes de fusionar.

Usa la plantilla de PR incluida en `.github/PULL_REQUEST_TEMPLATE.md`.

## Issues

Para funcionalidades utiliza la plantilla de feature request. Para errores incluye pasos reproducibles, entorno y evidencia. Redacta un issue por problema y evita incluir información sensible.
