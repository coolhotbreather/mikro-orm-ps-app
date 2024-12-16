import amqp from 'amqplib';

const connectToRabbitMQ = async () => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queue = 'my_queue';

  await channel.assertQueue(queue, {
    durable: true,
  });

  return { connection, channel, queue };
};

export const publishMessage = async (message: string) => {
  const { connection, channel, queue } = await connectToRabbitMQ();

  channel.sendToQueue(queue, Buffer.from(message), {
    persistent: true,
  });

  console.log('Message sent:', message);

  await channel.close();
  await connection.close();
};
