import { Author, Book, BaseEntity, MessageLog } from './entities';
declare const config: {
    entities: (typeof BaseEntity | typeof Book | typeof Author | typeof MessageLog)[];
    dbName: string;
    user: string;
    password: string;
    host: string;
    port: number;
    debug: boolean;
};
export default config;
