/// <reference types="node" />
import 'reflect-metadata';
import http from 'http';
import { EntityManager, EntityRepository, MikroORM } from '@mikro-orm/postgresql';
import { Author, Book } from './entities';
import mikroOrmConfig from './mikro-orm.config';
export declare const DI: {
    server: http.Server;
    orm: MikroORM;
    em: EntityManager;
    authors: EntityRepository<Author>;
    books: EntityRepository<Book>;
};
export declare const app: import("express-serve-static-core").Express;
export declare const init: (config: typeof mikroOrmConfig) => Promise<void>;
