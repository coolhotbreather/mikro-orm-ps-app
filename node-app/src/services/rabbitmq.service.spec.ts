import amqp from 'amqplib';
import { publishMessage } from './rabbitmq.service';

jest.mock('amqplib');

describe('RabbitMQ Service', () => {
  let mockChannel: any;
  let mockConnection: any;

  beforeEach(() => {
    mockChannel = {
      sendToQueue: jest.fn(),
      assertQueue: jest.fn(),
      close: jest.fn(),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn(),
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);
  });

  it('should publish a message to RabbitMQ', async () => {
    const message = 'Test message';

    await publishMessage(message);

    expect(amqp.connect).toHaveBeenCalledWith('amqp://localhost'); 
    expect(mockConnection.createChannel).toHaveBeenCalled();
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith('my_queue', Buffer.from(message), {
      persistent: true,
    });
    expect(mockChannel.close).toHaveBeenCalled();
    expect(mockConnection.close).toHaveBeenCalled();
  });
});
