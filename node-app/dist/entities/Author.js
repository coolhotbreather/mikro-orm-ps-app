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
exports.Author = void 0;
const postgresql_1 = require("@mikro-orm/postgresql");
const BaseEntity_1 = require("./BaseEntity");
const Book_1 = require("./Book");
let Author = class Author extends BaseEntity_1.BaseEntity {
    name;
    email;
    birthdate;
    biography;
    books = new postgresql_1.Collection(this);
    constructor(name, email) {
        super();
        this.name = name;
        this.email = email;
    }
};
exports.Author = Author;
__decorate([
    (0, postgresql_1.Property)(),
    (0, postgresql_1.Index)(),
    (0, postgresql_1.Unique)(),
    __metadata("design:type", String)
], Author.prototype, "name", void 0);
__decorate([
    (0, postgresql_1.Property)(),
    (0, postgresql_1.Unique)(),
    (0, postgresql_1.Index)(),
    __metadata("design:type", String)
], Author.prototype, "email", void 0);
__decorate([
    (0, postgresql_1.Property)({ nullable: true }),
    __metadata("design:type", Date)
], Author.prototype, "birthdate", void 0);
__decorate([
    (0, postgresql_1.Property)({ nullable: true }),
    __metadata("design:type", String)
], Author.prototype, "biography", void 0);
__decorate([
    (0, postgresql_1.OneToMany)(() => Book_1.Book, b => b.author, { cascade: [postgresql_1.Cascade.ALL] }),
    __metadata("design:type", Object)
], Author.prototype, "books", void 0);
exports.Author = Author = __decorate([
    (0, postgresql_1.Entity)(),
    __metadata("design:paramtypes", [String, String])
], Author);
