"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBook = void 0;
function validateBook(book) {
    const { title, publicationYear, genre, author } = book;
    const errors = [];
    // Проверка обязательных полей
    if (!title || typeof title !== 'string') {
        errors.push('Title is required and must be a string');
    }
    if (!publicationYear || typeof publicationYear !== 'number') {
        errors.push('Publication Year is required and must be a number');
    }
    if (!genre || typeof genre !== 'string') {
        errors.push('Genre is required and must be a string');
    }
    if (!author || typeof author !== 'object' || !author.id || typeof author.id !== "number") {
        errors.push('Author is required and must be an object with id of author');
    }
    return errors;
}
exports.validateBook = validateBook;
