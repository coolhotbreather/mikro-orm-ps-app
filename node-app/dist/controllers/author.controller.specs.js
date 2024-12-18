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
describe('author controller', () => {
    let container;
    beforeAll(async () => {
        container = await new postgresql_1.PostgreSqlContainer()
            .withDatabase("testdb")
            .withUsername("testuser")
            .withPassword("testpassword")
            .start();
        // Инициализация Mikro-ORM
        await (0, server_1.init)({
            entities: [entities_1.Author, entities_1.Book, entities_1.BaseEntity, entities_1.MessageLog],
            dbName: 'testdb',
            host: 'localhost',
            port: 5432,
            user: 'testuser',
            password: 'testpassword',
            debug: true,
        });
        // Запускаем миграции
        const migrator = server_1.DI.orm.getMigrator();
        await migrator.up();
    });
    afterAll(async () => {
        await server_1.DI.orm.close();
        await container.stop();
    });
    it(`CRUD`, async () => {
        let id;
        await (0, supertest_1.default)(server_1.app)
            .post('/author')
            .send({ name: 'a1', email: 'e1', books: [{ title: 'b1' }, { title: 'b2' }] })
            .then(res => {
            (0, expect_1.default)(res.status).toBe(200);
            (0, expect_1.default)(res.body.id).toBeDefined();
            (0, expect_1.default)(res.body.name).toBe('a1');
            (0, expect_1.default)(res.body.email).toBe('e1');
            (0, expect_1.default)(res.body.termsAccepted).toBe(false);
            (0, expect_1.default)(res.body.books).toHaveLength(2);
            id = res.body.id;
        });
        await (0, supertest_1.default)(server_1.app)
            .get('/author')
            .then(res => {
            (0, expect_1.default)(res.status).toBe(200);
            (0, expect_1.default)(res.body).toHaveLength(1);
            (0, expect_1.default)(res.body[0].id).toBeDefined();
            (0, expect_1.default)(res.body[0].name).toBe('a1');
            (0, expect_1.default)(res.body[0].email).toBe('e1');
            (0, expect_1.default)(res.body[0].termsAccepted).toBe(false);
            (0, expect_1.default)(res.body[0].books).toHaveLength(2);
        });
        await (0, supertest_1.default)(server_1.app)
            .put('/author/' + id)
            .send({ name: 'a2' })
            .then(res => {
            (0, expect_1.default)(res.status).toBe(200);
            (0, expect_1.default)(res.body.id).toBeDefined();
            (0, expect_1.default)(res.body.name).toBe('a2');
            (0, expect_1.default)(res.body.email).toBe('e1');
            (0, expect_1.default)(res.body.termsAccepted).toBe(false);
        });
    });
});
