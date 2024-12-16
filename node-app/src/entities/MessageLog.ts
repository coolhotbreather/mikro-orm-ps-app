import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from "./BaseEntity";

@Entity()
export class MessageLog extends BaseEntity {
  @Property()
  messageId!: string;

  constructor(messageId: string) {
    super();
    this.messageId = messageId;
  }
}