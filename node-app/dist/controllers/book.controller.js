"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookController = void 0;
const express_promise_router_1 = __importDefault(require("express-promise-router"));
const postgresql_1 = require("@mikro-orm/postgresql");
const server_1 = require("../server");
const validateBook_1 = require("../validators/validateBook");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_promise_router_1.default)();
// router.get('/', async (req: Request, res: Response) => {
//   const books = await DI.books.findAll({
//     populate: ['author'] as const,
//     orderBy: { title: QueryOrder.DESC },
//     limit: 20,
//   });
//   res.json(books);
// });
const AUTHOR = 'author';
const AUTHOR_ID = 'authorId';
const DEFAULT_LIST_FIELDS = ['title', 'publicationYear'];
const DESC = 'DESC';
router.get('/:id', async (req, res) => {
    try {
        const bookId = parseInt(req.params.id, 10);
        if (isNaN(bookId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        const book = await server_1.DI.books.findOne(bookId, {
            populate: [AUTHOR],
        });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    }
    catch (e) {
        return res.status(400).json({ message: e.message });
    }
});
router.post('/', async (req, res) => {
    try {
        const validationErrors = (0, validateBook_1.validateBook)(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: validationErrors.join(', ') });
        }
        // Получаем автора из базы данных по ID
        const author = await server_1.DI.authors.findOne({ id: req.body.author.id });
        if (!author) {
            return res.status(400).json({ message: 'Author not found' });
        }
        const book = server_1.DI.books.create(req.body);
        await server_1.DI.em.flush();
        res.json(book);
    }
    catch (e) {
        return res.status(400).json({ message: e.message });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const bookId = parseInt(req.params.id, 10);
        const validationErrors = (0, validateBook_1.validateBook)(req.body);
        if (isNaN(bookId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: validationErrors.join(', ') });
        }
        const book = await server_1.DI.books.findOne(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        (0, postgresql_1.wrap)(book).assign(req.body);
        await server_1.DI.em.flush();
        res.json(book);
    }
    catch (e) {
        return res.status(400).json({ message: e.message });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const bookId = parseInt(req.params.id, 10);
        if (isNaN(bookId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        const book = await server_1.DI.books.findOne(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        await server_1.DI.em.removeAndFlush(book);
        res.status(200).json({ message: 'Book deleted successfully' });
    }
    catch (e) {
        return res.status(500).json({ message: e.message });
    }
});
router.post('/_list', async (req, res) => {
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
        const [list, totalCount] = await server_1.DI.books.findAndCount(filters, {
            offset: pageIndex * size,
            limit: size,
            fields: DEFAULT_LIST_FIELDS,
            orderBy: { createdAt: DESC },
        });
        const totalPages = Math.ceil(totalCount / size);
        res.json({
            list,
            totalPages,
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error fetching data' });
    }
});
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.post('/upload', upload.single('file'), async (req, res) => {
    const filePath = req.file?.path;
    if (!filePath) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const { books } = req.body;
    let importedCount = 0;
    if (!Array.isArray(books)) {
        return res.status(400).json({ message: 'Invalid data format' });
    }
    await server_1.DI.em.begin();
    try {
        for (const bookData of books) {
            const validationErrors = (0, validateBook_1.validateBook)(bookData);
            if (validationErrors.length > 0) {
                throw new Error(`Invalid data for book: ${JSON.stringify(bookData)}`);
            }
            const book = server_1.DI.books.create(bookData);
            server_1.DI.em.persist(book); //persistAndFLush
            importedCount++;
        }
        await server_1.DI.em.commit();
        return res.json({
            success: true,
            importedCount,
        });
    }
    catch (error) {
        await server_1.DI.em.rollback();
        console.error('Error during file upload:', error);
        return res.status(500).json({ message: 'Failed to upload data' });
    }
});
exports.BookController = router;