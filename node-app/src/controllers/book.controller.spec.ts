import request from 'supertest';
import { app } from '../server'; // ваш express app
import { DI } from '../server'; // доступ к DI и базам данных
import { Book, Author } from '../entities';
import { validateBook } from '../validators/validateBook';
import e from 'express';

describe('BookController', () => {
  let bookId: number;
  let authorId: number;

  // Перед каждым тестом, возможно, создадим книгу для тестирования
  beforeAll(async () => {
    
    // await init;
    // DI.orm.config.set('dbName', 'express-test-db');
    // DI.orm.config.getLogger().setDebugMode(false);
    // await DI.orm.config.getDriver().reconnect();
    // await DI.orm.getSchemaGenerator().clearDatabase();

    const author = DI.authors.create({
      name: 'Test Author',
      email: 'test.author@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await DI.orm.em.persistAndFlush(author);

    // Сохраняем ID автора
    authorId = author.id;
  });

  afterAll(async () => {
    // await DI.orm.getSchemaGenerator().clearDatabase();
    // await DI.orm.close(true);
    // DI.server.close();
    await DI.em.nativeDelete(Book, {});
    await DI.em.nativeDelete(Author, {});
  });

  // Тест для создания книги
  it('should create a new book with an existing author', async () => {
    const bookData = {
      title: 'Test Book',
      publicationYear: 2024,
      genre: 'Fiction',
      author: { id: authorId },
    };

    const response = await request(app)
      .post('/book')
      .send(bookData)
      .expect(200);

    bookId = response.body.id; // Сохраняем ID книги для дальнейших тестов

    expect(response.body.title).toBe('Test Book');
    expect(response.body.author.id).toBe(authorId);
  });

  // Тест для получения книги по ID
  it('should get book by ID', async () => {
    const response = await request(app)
      .get(`/book/${bookId}`)
      .expect(200);

    expect(response.body.id).toBe(bookId);
    expect(response.body.title).toBe('Test Book');
    expect(response.body.author.id).toBe(authorId);
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
      author: { id: authorId },
    };

    const response = await request(app)
      .put(`/book/${bookId}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.title).toBe('Updated Test Book');
    expect(response.body.genre).toBe('Updated Fiction');
    expect(response.body.publicationYear).toBe(2025);
    expect(response.body.author.id).toBe(authorId);
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
    const response = await request(app)
      .post('/book/_list')
      .send({
        page: 1,
        size: 10,
        title: 'Test Book',
      })
      .expect(200);

    expect(response.body.list).toBeDefined();
    expect(response.body.list.length).toBeGreaterThanOrEqual(0);
    expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
  });

  // Тест для загрузки книг из файла
  it('should upload books from file', async () => {
    const bookData = [
      {
        title: 'Book 1',
        publicationYear: 2023,
        genre: 'Genre 1',
        author: { id: authorId },
      },
      {
        title: 'Book 2',
        publicationYear: 2024,
        genre: 'Genre 2',
        author: { id: authorId },
      },
    ];

    const response = await request(app)
      .post('/book/upload')
      .field('books', JSON.stringify(bookData))
      .attach('file', 'path/to/your/test/file.csv') // Путь к вашему файлу
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.importedCount).toBe(2);
  });

  // Тест для ошибки при загрузке файла, если файл отсутствует
  it('should return 400 if no file is uploaded', async () => {
    const response = await request(app)
      .post('/book/upload')
      .expect(400);

    expect(response.body.message).toBe('No file uploaded');
  });
});

