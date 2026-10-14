# Usamos una versión ligera y oficial de Node.js
FROM node:18-alpine

# Definimos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código del backend
COPY . .

# Exponemos el puerto donde corre Express
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]