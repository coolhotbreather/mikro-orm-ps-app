"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishMessage = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const connectToRabbitMQ = async () => {
    const connection = await amqplib_1.default.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'my_queue';
    await channel.assertQueue(queue, {
        durable: true,
    });
    return { connection, channel, queue };
};
const publishMessage = async (message) => {
    const { connection, channel, queue } = await connectToRabbitMQ();
    channel.sendToQueue(queue, Buffer.from(message), {
        persistent: true,
    });
    console.log('Message sent:', message);
    await channel.close();
    await connection.close();
};
exports.publishMessage = publishMessage;
