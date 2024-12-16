import { Collection } from '@mikro-orm/postgresql';
import { BaseEntity } from './BaseEntity';
import { Book } from './Book';
export declare class Author extends BaseEntity {
    name: string;
    email: string;
    birthdate?: Date;
    biography?: string;
    books: Collection<Book, object>;
    constructor(name: string, email: string);
}
