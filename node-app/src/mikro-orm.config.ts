import { Author, Book, BaseEntity, MessageLog } from './entities';

const config = {
  entities: [Author, Book, BaseEntity, MessageLog],
  dbName: 'mydatabase', // Назва вашої бази даних PostgreSQL
  user: 'user', // Ім'я користувача PostgreSQL
  password: 'password', // Пароль для PostgreSQL
  host: 'postgres', // Адреса хоста PostgreSQL
  port: 5432, // Порт PostgreSQL
  debug: true, // Увімкнення режиму відлагодження
};

export default config;
