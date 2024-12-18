"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const expect_1 = __importDefault(require("expect"));
const server_1 = require("../server");
const postgresql_1 = require("@testcontainers/postgresql");
const entities_1 = require("../entities");
const pg_1 = require("pg");
describe('author controller', () => {
    let postgresContainer;
    let postgresClient;
    let authorId;
    beforeAll(async () => {
        postgresContainer = await new postgresql_1.PostgreSqlContainer().start();
        postgresClient = new pg_1.Client({
            host: postgresContainer.getHost(),
            port: postgresContainer.getPort(),
            database: postgresContainer.getDatabase(),
            user: postgresContainer.getUsername(),
            password: postgresContainer.getPassword(),
        });
        await postgresClient.connect();
        // Инициализация Mikro-ORM
        await (0, server_1.init)({
            entities: [entities_1.Author, entities_1.Book, entities_1.BaseEntity, entities_1.MessageLog],
            host: postgresContainer.getHost(),
            port: postgresContainer.getPort(),
            dbName: postgresContainer.getDatabase(),
            user: postgresContainer.getUsername(),
            password: postgresContainer.getPassword(),
            debug: true,
        });
        // Запускаем миграции
        const migrator = server_1.DI.orm.getMigrator();
        await migrator.up();
    });
    afterAll(async () => {
        await postgresClient.end();
        await server_1.DI.orm.close();
        await server_1.DI.server.close();
        await postgresContainer.stop();
    });
    it('should create a new author', async () => {
        const authorData = {
            name: 'Test Author',
            email: 'test.author@example.com',
        };
        const response = await (0, supertest_1.default)(server_1.app)
            .post('/author')
            .send(authorData)
            .expect(201);
        authorId = response.body.id; // Сохраняем ID для использования в других тестах
        (0, expect_1.default)(response.body.name).toBe(authorData.name);
        (0, expect_1.default)(response.body.email).toBe(authorData.email);
    });
    it('should return all authors', async () => {
        const response = await (0, supertest_1.default)(server_1.app)
            .get('/author')
            .expect(200);
        (0, expect_1.default)(Array.isArray(response.body)).toBe(true);
        (0, expect_1.default)(response.body.length).toBeGreaterThan(0);
    });
    it('should return top authors based on book count', async () => {
        const knex = server_1.DI.em.getKnex();
        await knex.raw(`
      INSERT INTO book (id, title, publication_year, genre, author_id, created_at, updated_at) VALUES
      (10, 'Harry Potter and the Philosopher''s Stone', 1997, 'Fantasy', 1, current_timestamp, current_timestamp),
      (20, 'Harry Potter and the Chamber of Secrets', 1998, 'Fantasy', 1, current_timestamp, current_timestamp),
      (30, 'The Hobbit', 1997, 'Fantasy', 2, current_timestamp, current_timestamp),
      (40, 'The Fellowship of the Ring', 1997, 'Fantasy', 2, current_timestamp, current_timestamp),
      (50, 'A Game of Thrones', 1997, 'Fantasy', 3, current_timestamp, current_timestamp)
    `);
        const response = await (0, supertest_1.default)(server_1.app)
            .get('/author/top?n=2')
            .expect(200);
        (0, expect_1.default)(Array.isArray(response.body)).toBe(true);
        (0, expect_1.default)(response.body.length).toBeGreaterThan(0);
        (0, expect_1.default)(response.body[0].count).toBeGreaterThanOrEqual(response.body[1]?.count || 0);
    });
    it('should update author details', async () => {
        const updatedData = {
            name: 'Updated Author Name',
            email: 'updated.author@example.com',
        };
        const response = await (0, supertest_1.default)(server_1.app)
            .put(`/author/${authorId}`)
            .send(updatedData)
            .expect(200);
        (0, expect_1.default)(response.body.name).toBe(updatedData.name);
        (0, expect_1.default)(response.body.email).toBe(updatedData.email);
    });
    it('should delete author by ID', async () => {
        const response = await (0, supertest_1.default)(server_1.app)
            .delete(`/author/${authorId}`)
            .expect(200);
        (0, expect_1.default)(response.body.message).toBe('Author deleted successfully');
    });
});
