import { EntityManager } from '@mikro-orm/core';
export declare const ensureIdempotency: (messageId: string, em: EntityManager) => Promise<boolean>;
