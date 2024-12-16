import { EntityManager } from '@mikro-orm/core';
import { MessageLog } from '../entities/MessageLog';

export const ensureIdempotency = async (messageId: string, em: EntityManager) => {
  const existingMessage = await em.findOne(MessageLog, { messageId });
  if (existingMessage) {
    console.log('Message already processed');
    return false;
  }

  const log = new MessageLog(messageId);
  await em.persistAndFlush(log);
  return true;
};
