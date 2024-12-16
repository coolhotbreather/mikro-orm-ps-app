"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.app = exports.DI = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
// import mikroOrmConfig from './mikro-orm.config';
const postgresql_1 = require("@mikro-orm/postgresql");
const controllers_1 = require("./controllers");
const entities_1 = require("./entities");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
exports.DI = {};
exports.app = (0, express_1.default)();
const port = process.env.PORT || 3000;
exports.init = (async () => {
    exports.DI.orm = await postgresql_1.MikroORM.init(mikro_orm_config_1.default);
    exports.DI.em = exports.DI.orm.em;
    exports.DI.authors = exports.DI.orm.em.getRepository(entities_1.Author);
    exports.DI.books = exports.DI.orm.em.getRepository(entities_1.Book);
    exports.app.use(express_1.default.json());
    exports.app.use((req, res, next) => postgresql_1.RequestContext.create(exports.DI.orm.em, next));
    exports.app.get('/', (req, res) => res.json({ message: 'Welcome to MikroORM express TS example, try CRUD on /author and /book endpoints!' }));
    exports.app.use('/author', controllers_1.AuthorController);
    exports.app.use('/book', controllers_1.BookController);
    exports.app.use((req, res) => res.status(404).json({ message: 'No route found' }));
    exports.DI.server = exports.app.listen(port, () => {
        console.log(`MikroORM express TS example started at http://localhost:${port}`);
    });
})();
