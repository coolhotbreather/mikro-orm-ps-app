import { Entity, Property, ManyToOne, Index } from '@mikro-orm/postgresql';
import { BaseEntity } from './BaseEntity';
import { Author } from './Author';

@Entity()
export class Book extends BaseEntity {

  @Property()
  @Index()
  title: string;

  @Property()
  publicationYear: number;

  @Property()
  @Index()
  genre: string;

  @Property({ nullable: true })
  summary?: string;

  @ManyToOne(() => Author)
  @Index()
  author: Author;

  constructor(title: string, publicationYear: number, genre: string, author: Author) {
    super();
    this.title = title;
    this.publicationYear = publicationYear;
    this.genre = genre;
    this.author = author;
  }

}
