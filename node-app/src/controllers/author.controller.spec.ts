import request from 'supertest';
import expect from 'expect';
import { app, DI, init } from '../server';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Author, Book, BaseEntity, MessageLog } from '../entities';
import { Client } from 'pg';
import { closeRabbitMQ } from '../services/rabbitmq.service';

describe('author controller', () => {
  let postgresContainer: StartedPostgreSqlContainer;
  let postgresClient: Client;
  let authorId: number;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer().start();

    postgresClient = new Client({
      host: postgresContainer.getHost(),
      port: postgresContainer.getPort(),
      database: postgresContainer.getDatabase(),
      user: postgresContainer.getUsername(),
      password: postgresContainer.getPassword(),
    });
    await postgresClient.connect();

    // Инициализация Mikro-ORM
    await init({
      entities: [Author, Book, BaseEntity, MessageLog],
      host: postgresContainer.getHost(),
      port: postgresContainer.getPort(),
      dbName: postgresContainer.getDatabase(),
      user: postgresContainer.getUsername(),
      password: postgresContainer.getPassword(),
      debug: true,
    });

    // Запускаем миграции
    const migrator = DI.orm.getMigrator();
    await migrator.up();

  });

  afterAll(async () => {
    await closeRabbitMQ();
    await postgresClient.end();
    await DI.orm.close();
    await DI.server.close();
    await postgresContainer.stop();
  });

  it('should create a new author', async () => {
    const authorData = {
      name: 'Test Author',
      email: 'test.author@example.com',
    };

    const response = await request(app)
      .post('/author')
      .send(authorData)
      .expect(201);

    authorId = response.body.id; // Сохраняем ID для использования в других тестах

    expect(response.body.name).toBe(authorData.name);
    expect(response.body.email).toBe(authorData.email);
  });

  it('should return all authors', async () => {
    const response = await request(app)
      .get('/author')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should return top authors based on book count', async () => {
    const knex = DI.em.getKnex();

    await knex.raw(`
      INSERT INTO book (id, title, publication_year, genre, author_id, created_at, updated_at) VALUES
      (10, 'Harry Potter and the Philosopher''s Stone', 1997, 'Fantasy', 1, current_timestamp, current_timestamp),
      (20, 'Harry Potter and the Chamber of Secrets', 1998, 'Fantasy', 1, current_timestamp, current_timestamp),
      (30, 'The Hobbit', 1997, 'Fantasy', 2, current_timestamp, current_timestamp),
      (40, 'The Fellowship of the Ring', 1997, 'Fantasy', 2, current_timestamp, current_timestamp),
      (50, 'A Game of Thrones', 1997, 'Fantasy', 3, current_timestamp, current_timestamp)
    `);

    const response = await request(app)
      .get('/author/top?n=2')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].count).toBeGreaterThanOrEqual(response.body[1]?.count || 0);
  });

  it('should update author details', async () => {
    const updatedData = {
      name: 'Updated Author Name',
      email: 'updated.author@example.com',
    };

    const response = await request(app)
      .put(`/author/${authorId}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.name).toBe(updatedData.name);
    expect(response.body.email).toBe(updatedData.email);
  });

  it('should delete author by ID', async () => {
    const response = await request(app)
      .delete(`/author/${authorId}`)
      .expect(200);

    expect(response.body.message).toBe('Author deleted successfully');
  });

});
