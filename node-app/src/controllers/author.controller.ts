import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { QueryOrder, wrap } from '@mikro-orm/postgresql';
import { Author } from '../entities';

import { DI } from '../server';
import { validateAuthor } from '../validators/validateAuthor';
import { ensureIdempotency } from '../services/idempotency.service';
import { publishMessage } from '../services/rabbitmq.service';
import logger from '../services/logger.service';

const BOOKS = 'books';
const DEFAULT_TOP_AUTHORS_FILTER_COUNT = 10;
const getMessageId = (id: number): string => `author-${id}`

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const authors = await DI.authors.findAll({
      populate: [BOOKS] as readonly (keyof Author)[],
      orderBy: { name: QueryOrder.DESC },
    });
    res.json(authors);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

router.get('/top', async (req: Request, res: Response) => {
  const n = parseInt(req.query.n as string) || DEFAULT_TOP_AUTHORS_FILTER_COUNT;

  try {
    const knex = DI.em.getKnex();

    const result = await knex('authors') // Начинаем с таблицы authors (Entity2)
      .leftJoin('books', 'books.author_id', 'authors.id') // Соединяем с таблицей books (Entity1)
      .select('authors.id', 'authors.name') // Выбираем нужные поля из authors
      .count('books.id as count') // Подсчитываем количество связанных книг
      .groupBy('authors.id', 'authors.name') // Группируем по полям authors
      .orderBy('count', 'desc') // Сортируем по убыванию количества книг
      .limit(n); // Ограничиваем результат топ-N

    const topAuthors = result.map(row => ({
      id: row.id,
      name: row.name,
      count: row.count,
    }));

    res.json(topAuthors);
  } catch (err) {
    console.error('Error fetching top authors:', err);
    res.status(500).json({ message: 'Error fetching top-N authors' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { name, email } = req.body;

  try {
    const validationErrors = validateAuthor(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors.join(', ') });
    }
    
    const existingAuthor = await DI.authors.findOne({ name });
    if (existingAuthor) {
      return res.status(400).json({ message: 'Author name must be unique' });
    }

    const existingEmail = await DI.authors.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email must be unique' });
    }

    const author = DI.authors.create(req.body);

    logger.info('Creating new author', { author: author.id });

    await DI.em.persistAndFlush(author);

    const messageId = getMessageId(author.id);
    if (await ensureIdempotency(messageId, DI.em)) {
      const message = JSON.stringify({
        authorId: author.id,
        action: 'created',
      });

      await publishMessage(message);

      logger.info('Message sent to RabbitMQ', { messageId });
    }

    res.status(201).json(author);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating author' });
  }
});


router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params; // Отримуємо ID сутності, яку потрібно змінити
  const { name, email } = req.body; // Витягуємо нові значення для полів

  const authorId = parseInt(req.params.id, 10);

  try {
    
    if (isNaN(authorId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Знайдемо сутність за ID
    const existingAuthor = await DI.authors.findOne(authorId);

    if (!existingAuthor) {
      return res.status(404).json({ message: 'Entity not found' });
    }

    // Перевірка на унікальність ім'я автора
    if (name && name !== existingAuthor.name) {
      const existingName = await DI.authors.findOne({ name });
      if (existingName) {
        return res.status(400).json({ message: 'Author name must be unique' });
      }
    }

    // Перевірка на унікальність email
    if (email && email !== existingAuthor.email) {
      const existingEmail = await DI.authors.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email must be unique' });
      }
    }

    // Оновлення полів
    existingAuthor.name = name || existingAuthor.name;
    existingAuthor.email = email || existingAuthor.email;

    // Зберігаємо зміни в БД
    await DI.em.persistAndFlush(existingAuthor);

    return res.status(200).json(existingAuthor);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating entity' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const authorId = parseInt(req.params.id, 10);

    if (isNaN(authorId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const author = await DI.authors.findOne(authorId);

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    await DI.em.removeAndFlush(author);

    res.status(200).json({ message: 'Author deleted successfully' });
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
});

export const AuthorController = router;
