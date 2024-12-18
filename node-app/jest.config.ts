import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testEnvironment: 'node',
  testTimeout: 30000, // Увеличиваем таймаут, если тесты долго выполняются
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // Применяем ts-jest для всех .ts и .tsx файлов
  },
  preset: 'ts-jest',
};

export default config;
