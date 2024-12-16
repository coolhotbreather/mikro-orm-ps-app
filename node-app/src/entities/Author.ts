import { Cascade, Collection, Entity, OneToMany, Property, ManyToOne, Index, Unique } from '@mikro-orm/postgresql';
import { BaseEntity } from './BaseEntity';
import { Book } from './Book';

@Entity()
export class Author extends BaseEntity {

  @Property()
  @Index()
  @Unique()
  name: string;

  @Property()
  @Unique()
  @Index()
  email: string;

  @Property({ nullable: true })
  birthdate?: Date;

  @Property({ nullable: true })
  biography?: string;

  @OneToMany(() => Book, b => b.author, { cascade: [Cascade.ALL] })
  books = new Collection<Book>(this);

  constructor(name: string, email: string) {
    super();
    this.name = name;
    this.email = email;
  }

}
