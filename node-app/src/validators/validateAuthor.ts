// src/validators/bookValidator.ts
interface AuthorData {
    name: string;
    email: string;
}

export function validateAuthor(author: AuthorData) {
    const { name, email} = author;
  
    const errors: string[] = [];
  
    if (!name || name.length < 3) {
      errors.push('Name must be at least 3 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  
    return errors;
  }
  