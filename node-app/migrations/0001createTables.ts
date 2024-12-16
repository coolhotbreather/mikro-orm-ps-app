import { Migration } from '@mikro-orm/migrations';

export class Migration20241216053749 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop table if exists "author" cascade;`);

    this.addSql(`drop table if exists "book" cascade;`);

    this.addSql(`drop table if exists "message_log" cascade;`);
    
    this.addSql(`create table "author" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "email" varchar(255) not null, "birthdate" timestamptz null, "biography" varchar(255) null);`);
    this.addSql(`create index "author_name_index" on "author" ("name");`);
    this.addSql(`alter table "author" add constraint "author_name_unique" unique ("name");`);
    this.addSql(`create index "author_email_index" on "author" ("email");`);
    this.addSql(`alter table "author" add constraint "author_email_unique" unique ("email");`);

    this.addSql(`create table "book" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(255) not null, "publication_year" int not null, "genre" varchar(255) not null, "summary" varchar(255) null, "author_id" int not null);`);
    this.addSql(`create index "book_title_index" on "book" ("title");`);
    this.addSql(`create index "book_genre_index" on "book" ("genre");`);
    this.addSql(`create index "book_author_id_index" on "book" ("author_id");`);

    this.addSql(`create table "message_log" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "message_id" varchar(255) not null);`);

    this.addSql(`alter table "book" add constraint "book_author_id_foreign" foreign key ("author_id") references "author" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "book" drop constraint "book_author_id_foreign";`);

    this.addSql(`drop table if exists "author" cascade;`);

    this.addSql(`drop table if exists "book" cascade;`);

    this.addSql(`drop table if exists "message_log" cascade;`);
  }

}
