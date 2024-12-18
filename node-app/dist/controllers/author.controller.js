"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorController = void 0;
const express_promise_router_1 = __importDefault(require("express-promise-router"));
const postgresql_1 = require("@mikro-orm/postgresql");
const server_1 = require("../server");
const validateAuthor_1 = require("../validators/validateAuthor");
const idempotency_service_1 = require("../services/idempotency.service");
const rabbitmq_service_1 = require("../services/rabbitmq.service");
const logger_service_1 = __importDefault(require("../services/logger.service"));
const BOOKS = 'books';
const DEFAULT_TOP_AUTHORS_FILTER_COUNT = 10;
const getMessageId = (id) => `author-${id}`;
const router = (0, express_promise_router_1.default)();
router.get('/', async (req, res) => {
    try {
        const authors = await server_1.DI.authors.findAll({
            populate: [BOOKS],
            orderBy: { name: postgresql_1.QueryOrder.DESC },
        });
        res.json(authors);
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
});
router.get('/top', async (req, res) => {
    const n = parseInt(req.query.n) || DEFAULT_TOP_AUTHORS_FILTER_COUNT;
    try {
        const knex = server_1.DI.em.getKnex();
        const result = await knex('author') // Начинаем с таблицы authors (Entity2)
            .leftJoin('book', 'book.author_id', 'author.id') // Соединяем с таблицей books (Entity1)
            .select('author.id', 'author.name') // Выбираем нужные поля из authors
            .count('book.id as count') // Подсчитываем количество связанных книг
            .groupBy('author.id', 'author.name') // Группируем по полям authors
            .orderBy('count', 'desc') // Сортируем по убыванию количества книг
            .limit(n); // Ограничиваем результат топ-N
        const topAuthors = result.map(row => ({
            id: row.id,
            name: row.name,
            count: parseInt(row.count, 10),
        }));
        res.json(topAuthors);
    }
    catch (err) {
        console.error('Error fetching top authors:', err);
        res.status(500).json({ message: 'Error fetching top-N authors' });
    }
});
router.post('/', async (req, res) => {
    const { name, email } = req.body;
    try {
        const validationErrors = (0, validateAuthor_1.validateAuthor)(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: validationErrors.join(', ') });
        }
        const existingAuthor = await server_1.DI.authors.findOne({ name });
        if (existingAuthor) {
            return res.status(400).json({ message: 'Author name must be unique' });
        }
        const existingEmail = await server_1.DI.authors.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email must be unique' });
        }
        const author = server_1.DI.authors.create(req.body);
        logger_service_1.default.info('Creating new author', { author: author.id });
        await server_1.DI.em.persistAndFlush(author);
        const messageId = getMessageId(author.id);
        if (await (0, idempotency_service_1.ensureIdempotency)(messageId, server_1.DI.em)) {
            const message = JSON.stringify({
                authorId: author.id,
                action: 'created',
            });
            await (0, rabbitmq_service_1.publishMessage)(message);
            logger_service_1.default.info('Message sent to RabbitMQ', { messageId });
        }
        res.status(201).json(author);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating author' });
    }
});
router.put('/:id', async (req, res) => {
    const { id } = req.params; // Отримуємо ID сутності, яку потрібно змінити
    const { name, email } = req.body; // Витягуємо нові значення для полів
    const authorId = parseInt(req.params.id, 10);
    try {
        if (isNaN(authorId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        // Знайдемо сутність за ID
        const existingAuthor = await server_1.DI.authors.findOne(authorId);
        if (!existingAuthor) {
            return res.status(404).json({ message: 'Entity not found' });
        }
        // Перевірка на унікальність ім'я автора
        if (name && name !== existingAuthor.name) {
            const existingName = await server_1.DI.authors.findOne({ name });
            if (existingName) {
                return res.status(400).json({ message: 'Author name must be unique' });
            }
        }
        // Перевірка на унікальність email
        if (email && email !== existingAuthor.email) {
            const existingEmail = await server_1.DI.authors.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email must be unique' });
            }
        }
        // Оновлення полів
        existingAuthor.name = name || existingAuthor.name;
        existingAuthor.email = email || existingAuthor.email;
        // Зберігаємо зміни в БД
        await server_1.DI.em.persistAndFlush(existingAuthor);
        return res.status(200).json(existingAuthor);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating entity' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const authorId = parseInt(req.params.id, 10);
        if (isNaN(authorId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        const author = await server_1.DI.authors.findOne(authorId);
        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }
        await server_1.DI.em.removeAndFlush(author);
        res.status(200).json({ message: 'Author deleted successfully' });
    }
    catch (e) {
        return res.status(500).json({ message: e.message });
    }
});
exports.AuthorController = router;
