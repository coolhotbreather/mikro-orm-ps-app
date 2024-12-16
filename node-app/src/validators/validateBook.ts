// src/validators/bookValidator.ts
interface BookData {
    title: string;
    publicationYear: number;
    genre: string;
    author: { id: number };
}

export function validateBook(book: BookData) {
    const { title, publicationYear, genre, author } = book;
  
    const errors: string[] = [];
  
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
  