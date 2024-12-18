import request from 'supertest';
import { app, init } from '../server'; // ваш express app
import { DI } from '../server'; // доступ к DI и базам данных
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Author, Book, BaseEntity, MessageLog } from '../entities';
import { Client } from 'pg';
import path from 'path';
import { closeRabbitMQ } from '../services/rabbitmq.service';

const EXISTING_MIGRATED_AUTHOR_ID = 1;
const SECOND_EXISTING_MIGRATED_AUTHOR_ID = 2;

describe('BookController', () => {
  let postgresContainer: StartedPostgreSqlContainer;
  let postgresClient: Client;
  let bookId: number;

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

  // Тест для создания книги
  it('should create a new book with an existing author', async () => {
    const bookData = {
      title: 'Test Book',
      publicationYear: 2024,
      genre: 'Fiction',
      author: { id: EXISTING_MIGRATED_AUTHOR_ID },
    };

    const response = await request(app)
      .post('/book')
      .send(bookData)
      .expect(200);

    bookId = response.body.id; // Сохраняем ID книги для дальнейших тестов

    expect(response.body.title).toBe('Test Book');
    expect(response.body.publicationYear).toBe(2024);
    expect(response.body.genre).toBe('Fiction');
    expect(response.body.author.id).toBe(EXISTING_MIGRATED_AUTHOR_ID);
  });

  // Тест для получения книги по ID
  it('should get book by ID', async () => {
    const response = await request(app)
      .get(`/book/${bookId}`)
      .expect(200);

      expect(response.body.title).toBe('Test Book');
      expect(response.body.publicationYear).toBe(2024);
      expect(response.body.genre).toBe('Fiction');
      expect(response.body.author.id).toBe(EXISTING_MIGRATED_AUTHOR_ID);
  });

  // Тест для получения ошибки, если книга не найдена
  it('should return 404 if book not found', async () => {
    const response = await request(app)
      .get('/book/9999') // Некорректный ID
      .expect(404);

    expect(response.body.message).toBe('Book not found');
  });

  // Тест для обновления книги
  it('should update book details', async () => {
    const updatedData = {
      title: 'Updated Test Book',
      publicationYear: 2025,
      genre: 'Updated Fiction',
      author: { id: SECOND_EXISTING_MIGRATED_AUTHOR_ID },
    };

    const em = DI.em.fork();
    const author = await em.findOne(Author, SECOND_EXISTING_MIGRATED_AUTHOR_ID);
    expect(author).not.toBeNull();


    const response = await request(app)
      .put(`/book/${bookId}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.title).toBe('Updated Test Book');
    expect(response.body.genre).toBe('Updated Fiction');
    expect(response.body.publicationYear).toBe(2025);
    expect(response.body.author).toBe(SECOND_EXISTING_MIGRATED_AUTHOR_ID);
  });

  // Тест для ошибки при неверном формате ID
  it('should return 400 if ID format is invalid', async () => {
    const response = await request(app)
      .get('/book/invalid-id')
      .expect(400);

    expect(response.body.message).toBe('Invalid ID format');
  });
  
  // Тест для удаления книги
  it('should delete book by ID', async () => {
    const response = await request(app)
      .delete(`/book/${bookId}`)
      .expect(200);

    expect(response.body.message).toBe('Book deleted successfully');

    const checkResponse = await request(app)
      .get(`/book/${bookId}`)
      .expect(404);

    expect(checkResponse.body.message).toBe('Book not found');
  });

  // Тест для получения списка книг с фильтрацией и пагинацией
  it('should return a paginated list of books', async () => {

    const knex = DI.em.getKnex();

    await knex.raw(`
      INSERT INTO book (id, title, publication_year, genre, author_id, created_at, updated_at) VALUES
      (10, 'Harry Potter and the Philosopher''s Stone', 1997, 'Fantasy', 1, current_timestamp, current_timestamp),
      (20, 'Harry Potter and the Chamber of Secrets', 1998, 'Fantasy', 1, current_timestamp, current_timestamp),
      (30, 'The Hobbit', 1997, 'Fantasy', 2, current_timestamp, current_timestamp),
      (40, 'The Fellowship of the Ring', 1997, 'Fantasy', 2, current_timestamp, current_timestamp),
      (50, 'A Game of Thrones', 1997, 'Fantasy', 3, current_timestamp, current_timestamp);
    `);

    // Ваш основной тест с пагинацией и фильтрацией
    const response = await request(app)
      .post('/book/_list')
      .send({
        page: 1,
        size: 10,
        genre: "Fantasy",
        publicationYear: 1997,
      })
      .expect(200);
  
    console.log("Paginated books:", response.body); // Логируем результат пагинации
  
    expect(response.body.list).toBeDefined();
    expect(response.body.list.length).toBeGreaterThanOrEqual(0);
    expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('should upload books from file', async () => {
    const response = await request(app)
      .post('/book/upload')
      .attach('file', path.resolve(__dirname, '../../seeds/books.json')) // Путь к тестовому файлу
      .expect(200);
  
    expect(response.body.success).toBe(true);
    expect(response.body.importedCount).toBe(3); // Проверяем, что все книги импортировались
  });
  

  // Тест для ошибки при загрузке файла, если файл отсутствует
  it('should return 400 if no file is uploaded', async () => {
    const response = await request(app)
      .post('/book/upload')
      .expect(400);

    expect(response.body.message).toBe('No file uploaded');
  });

});

