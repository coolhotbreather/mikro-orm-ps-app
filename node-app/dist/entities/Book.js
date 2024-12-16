"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = void 0;
const postgresql_1 = require("@mikro-orm/postgresql");
const BaseEntity_1 = require("./BaseEntity");
const Author_1 = require("./Author");
let Book = class Book extends BaseEntity_1.BaseEntity {
    title;
    publicationYear;
    genre;
    summary;
    author;
    constructor(title, publicationYear, genre, author) {
        super();
        this.title = title;
        this.publicationYear = publicationYear;
        this.genre = genre;
        this.author = author;
    }
};
exports.Book = Book;
__decorate([
    (0, postgresql_1.Property)(),
    (0, postgresql_1.Index)(),
    __metadata("design:type", String)
], Book.prototype, "title", void 0);
__decorate([
    (0, postgresql_1.Property)(),
    __metadata("design:type", Number)
], Book.prototype, "publicationYear", void 0);
__decorate([
    (0, postgresql_1.Property)(),
    (0, postgresql_1.Index)(),
    __metadata("design:type", String)
], Book.prototype, "genre", void 0);
__decorate([
    (0, postgresql_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], Book.prototype, "summary", void 0);
__decorate([
    (0, postgresql_1.ManyToOne)(() => Author_1.Author),
    (0, postgresql_1.Index)(),
    __metadata("design:type", Author_1.Author)
], Book.prototype, "author", void 0);
exports.Book = Book = __decorate([
    (0, postgresql_1.Entity)(),
    __metadata("design:paramtypes", [String, Number, String, Author_1.Author])
], Book);
