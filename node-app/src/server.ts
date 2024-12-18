import 'reflect-metadata';
import http from 'http';
import express from 'express';
import { EntityManager, EntityRepository, MikroORM, RequestContext } from '@mikro-orm/postgresql';
import { AuthorController, BookController } from './controllers';
import { Author, Book } from './entities';
import mikroOrmConfig from './mikro-orm.config';
import { closeRabbitMQ, consumeMessages } from './services/rabbitmq.service';
import amqp, { Connection, Channel } from 'amqplib';

export const DI = {} as {
  server: http.Server;
  orm: MikroORM,
  em: EntityManager,
  authors: EntityRepository<Author>,
  books: EntityRepository<Book>,
  rabbitConnection: {},
  rabbitChannel: {},
};

export const app = express();
const port = process.env.PORT || 3000;

export const init = async (config: typeof mikroOrmConfig) => {
  DI.orm = await MikroORM.init(config);
  DI.em = DI.orm.em;
  DI.authors = DI.orm.em.getRepository(Author);
  DI.books = DI.orm.em.getRepository(Book);

  app.use(express.json());
  app.use((req, res, next) => RequestContext.create(DI.orm.em, next));
  app.get('/', (req, res) => res.json({ message: 'Welcome to MikroORM express TS example, try CRUD on /author and /book endpoints!' }));
  app.use('/author', AuthorController);
  app.use('/book', BookController);
  app.use((req, res) => res.status(404).json({ message: 'No route found' }));

  DI.server = app.listen(port, () => {
    console.log(`MikroORM express TS example started at http://localhost:${port}`);
  });

  await consumeMessages();
};