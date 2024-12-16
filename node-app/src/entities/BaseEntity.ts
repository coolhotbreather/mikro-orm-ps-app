import { PrimaryKey, Property } from '@mikro-orm/core';

export abstract class BaseEntity {
  @PrimaryKey()
  id!: number; // Використовуємо числовий ID для PostgreSQL. Для UUID можна використовувати `string`.

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
