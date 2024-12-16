import { BaseEntity } from './BaseEntity';
import { Author } from './Author';
export declare class Book extends BaseEntity {
    title: string;
    publicationYear: number;
    genre: string;
    summary?: string;
    author: Author;
    constructor(title: string, publicationYear: number, genre: string, author: Author);
}
