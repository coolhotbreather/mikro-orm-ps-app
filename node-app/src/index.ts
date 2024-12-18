// index.ts
import { init } from './server';
import mikroOrmConfig from './mikro-orm.config';

(async () => {
  try {
    await init(mikroOrmConfig);
  } catch (err) {
    console.error('Failed to initialize the app', err);
    throw err; // или console.log(err) для тестов
  }
})();
