"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureIdempotency = void 0;
const MessageLog_1 = require("../entities/MessageLog");
const ensureIdempotency = async (messageId, em) => {
    const existingMessage = await em.findOne(MessageLog_1.MessageLog, { messageId });
    if (existingMessage) {
        console.log('Message already processed');
        return false;
    }
    const log = new MessageLog_1.MessageLog(messageId);
    await em.persistAndFlush(log);
    return true;
};
exports.ensureIdempotency = ensureIdempotency;
