"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts
const server_1 = require("./server");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
(async () => {
    try {
        await (0, server_1.init)(mikro_orm_config_1.default);
    }
    catch (err) {
        console.error('Failed to initialize the app', err);
        throw err; // или console.log(err) для тестов
    }
})();
