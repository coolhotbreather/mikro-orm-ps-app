"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entities_1 = require("./entities");
const config = {
    entities: [entities_1.Author, entities_1.Book, entities_1.BaseEntity, entities_1.MessageLog],
    dbName: 'mydatabase', // Назва вашої бази даних PostgreSQL
    user: 'user', // Ім'я користувача PostgreSQL
    password: 'password', // Пароль для PostgreSQL
    host: 'postgres', // Адреса хоста PostgreSQL
    port: 5432, // Порт PostgreSQL
    debug: true, // Увімкнення режиму відлагодження
};
exports.default = config;
