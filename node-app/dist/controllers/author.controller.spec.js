"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const expect_1 = __importDefault(require("expect"));
const server_1 = require("../server");
describe('author controller', () => {
    beforeAll(async () => {
        await server_1.init;
        server_1.DI.orm.config.set('dbName', 'express-test-db');
        server_1.DI.orm.config.getLogger().setDebugMode(false);
        await server_1.DI.orm.config.getDriver().reconnect();
        await server_1.DI.orm.getSchemaGenerator().clearDatabase();
    });
    afterAll(async () => {
        await server_1.DI.orm.close(true);
        server_1.DI.server.close();
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
