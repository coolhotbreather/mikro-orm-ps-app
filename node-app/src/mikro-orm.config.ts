import { defineConfig } from '@mikro-orm/postgresql';
import { Author, Book, BaseEntity, MessageLog } from './entities';

export default defineConfig({
  entities: [Author, Book, BaseEntity, MessageLog],
  dbName: 'mydatabase', // Назва вашої бази даних PostgreSQL
  user: 'user', // Ім'я користувача PostgreSQL
  password: 'password', // Пароль для PostgreSQL
  host: 'postgres', // Адреса хоста PostgreSQL
  port: 5432, // Порт PostgreSQL
  debug: true, // Увімкнення режиму відлагодження
});