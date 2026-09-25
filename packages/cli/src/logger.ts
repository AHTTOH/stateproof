import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { requireEnv } from './config.js';

export type Logger = pino.Logger;

export const createLogger = (): Logger =>
  pino({ level: requireEnv('LOG_LEVEL') }, pinoPretty({ colorize: true, sync: true, translateTime: 'SYS:HH:MM:ss' }));
