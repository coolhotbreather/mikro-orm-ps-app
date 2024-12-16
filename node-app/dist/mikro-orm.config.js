"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgresql_1 = require("@mikro-orm/postgresql");
const entities_1 = require("./entities");
exports.default = (0, postgresql_1.defineConfig)({
    entities: [entities_1.Author, entities_1.Book, entities_1.BaseEntity, entities_1.MessageLog],
    dbName: 'mydatabase', // Назва вашої бази даних PostgreSQL
    user: 'user', // Ім'я користувача PostgreSQL
    password: 'password', // Пароль для PostgreSQL
    host: 'postgres', // Адреса хоста PostgreSQL
    port: 5432, // Порт PostgreSQL
    debug: true, // Увімкнення режиму відлагодження
});
