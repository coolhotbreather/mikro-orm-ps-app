import { Migration } from '@mikro-orm/migrations';
import fs from "fs";

export class Migration20241216030108 extends Migration {

  override async up(): Promise<void> {
    const authors = JSON.parse(fs.readFileSync('./seeds/authors.json', 'utf-8'));
     for (const author of authors) {
      this.addSql(`insert into "author" ("name", "email", "birthdate", "biography", "created_at", "updated_at") 
        values ('${author.name}', '${author.email}', '${author.birthdate}', '${author.biography}', current_timestamp, current_timestamp)`);
    }
  }

  override async down(): Promise<void> {
    this.addSql('delete from "author";');
  }

}
    