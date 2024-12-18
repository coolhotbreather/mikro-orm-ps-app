import amqp, { Connection, Channel } from 'amqplib';
import logger from './logger.service';

// Сохранение соединения и канала в переменные для повторного использования
let connection: Connection | null = null;
let channel: Channel | null = null;
const queue = 'my_queue';

const connectToRabbitMQ = async () => {
  if (!connection || !channel) {
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
  }
  return { connection, channel, queue };
};

export const publishMessage = async (message: string) => {
  try {
    const { channel, queue } = await connectToRabbitMQ();

    if (!channel) throw new Error('Channel is not initialized');

    channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

    console.log('Message sent:', message);

    // Closing after the operation is done
    await channel.close();
    await connection?.close();
  } catch (error) {
    console.error('Error publishing message:', error);
  }
};

export const consumeMessages = async () => {
  try {
    const { connection, channel, queue } = await connectToRabbitMQ();

    channel?.consume(queue, async (msg) => {
      if (msg) {
        const message = msg.content.toString();

        try {
          const parsedMessage = JSON.parse(message);
          const { authorId, action } = parsedMessage;

          if (action === 'created') {
            logger.info(`RabbitM | Processing author creation for ID: ${authorId}`);
          }

          channel?.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          channel?.nack(msg);
        }
      }
    });

    console.log('Waiting for messages in %s. To exit press CTRL+C', queue);
  } catch (error) {
    console.error('Error consuming messages:', error);
  }
};

// Функция для закрытия соединения и канала RabbitMQ
export const closeRabbitMQ = async () => {
  try {
    if (channel) {
      await channel.close();
      console.log('RabbitMQ channel closed');
    }
    if (connection) {
      await connection.close();
      console.log('RabbitMQ connection closed');
    }
  } catch (error) {
    console.error('Error closing RabbitMQ connection or channel', error);
  }
};
