# Используем официальный образ Node.js
FROM node:23.3.0

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json в /app
COPY node-app/package*.json /app/

# Set env
ENV NODE_ENV=production

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы приложения в /app
COPY node-app /app

# Указываем команду для запуска приложения
CMD ["npm", "start"]
