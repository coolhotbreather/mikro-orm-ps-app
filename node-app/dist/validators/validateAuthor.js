"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuthor = void 0;
function validateAuthor(author) {
    const { name, email } = author;
    const errors = [];
    if (!name || name.length < 3) {
        errors.push('Name must be at least 3 characters long');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Invalid email format');
    }
    return errors;
}
exports.validateAuthor = validateAuthor;
