import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { QueryOrder, wrap } from '@mikro-orm/postgresql';
import { DI } from '../server';
import { Book } from '../entities';
import { validateBook } from '../validators/validateBook';
import multer from 'multer';
import fs from 'fs';


const router = Router();

const AUTHOR = 'author';
const AUTHOR_ID = 'authorId';
const DEFAULT_LIST_FIELDS = ['title', 'publicationYear'];
const DESC = 'DESC';

router.get('/:id', async (req: Request, res: Response) => {
  try {  
    const bookId = parseInt(req.params.id, 10);

    if (isNaN(bookId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const book = await DI.books.findOne(bookId, {
      populate: [AUTHOR] as readonly (keyof Book)[],
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validationErrors = validateBook(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors.join(', ') });
    }

    // Получаем автора из базы данных по ID
    const author = await DI.authors.findOne({ id: req.body.author.id });

    if (!author) {
      return res.status(400).json({ message: 'Author not found' });
    }

    const book = DI.books.create(req.body);
    await DI.em.flush();

    res.json(book);
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const validationErrors = validateBook(req.body);
      
    if (isNaN(bookId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors.join(', ') });
    }

    const book = await DI.books.findOne(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    wrap(book).assign(req.body);
    await DI.em.flush();

    res.json(book);
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const bookId = parseInt(req.params.id, 10);

    if (isNaN(bookId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const book = await DI.books.findOne(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await DI.em.removeAndFlush(book);

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
});

router.post('/_list', async (req: Request, res: Response) => {
  const { page = 1, size = 20, ...filters } = req.body;

  const pageIndex = page - 1;

  const filterKeys = Object.keys(filters);
  const isFilters = filterKeys.length;
  
  if (AUTHOR_ID in filters) {
    filters.author = filters.authorId;
    delete filters.authorId;
  }
  
  try {
    
    if (isFilters && (filterKeys.length < 2 || filterKeys.length > 3)) {
      return res.status(400).json({ message: 'Filters should be between 2 and 3 fields' });
    }

    const [list, totalCount] = await DI.books.findAndCount(
      filters,
      {
        offset: pageIndex * size,
        limit: size,
        fields: DEFAULT_LIST_FIELDS as readonly (keyof Book)[],
        orderBy: { createdAt: DESC },
      }
    );

    const totalPages = Math.ceil(totalCount / size);

    res.json({
      list,
      totalPages,
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  const filePath = req.file?.path;

  if (!filePath) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  let importedCount = 0;

  try {
    // Читаем файл
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const books = JSON.parse(fileContent);

    if (!Array.isArray(books)) {
      throw new Error('Invalid file format: expected an array of books');
    }

    const em = DI.em.fork();

    await em.begin();

    for (const bookData of books) {
      const validationErrors = validateBook(bookData);

      if (validationErrors.length > 0) {
        throw new Error(`Invalid data for book: ${JSON.stringify(bookData)}`);
      }

      const book = em.create(Book, bookData);
      em.persist(book); // Только persist (flush сделаем позже)
      importedCount++;
    }

    await em.flush(); // Сохраняем все изменения разом
    await em.commit();

    return res.status(200).json({
      success: true,
      importedCount,
    });
  } catch (error) {
    await DI.em.rollback();
    console.error('Error during file upload:', error);
    return res.status(500).json({ message: 'Failed to upload data' });
  } finally {
    // Удаляем временный файл
    if (filePath) {
      await fs.promises.unlink(filePath);
    }
  }
});

export const BookController = router;
