import winston from 'winston';

const fileTransport = new winston.transports.File({
  filename: 'app.log',
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

const consoleTransport = new winston.transports.Console({
  level: 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
});

// Создаем логгер
const logger = winston.createLogger({
  transports: [fileTransport, consoleTransport],
});

export default logger;
