import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { optionalEnv } from './config.js';

export type Logger = pino.Logger;

// LOG_LEVEL: fatal | error | warn | info | debug | trace (info when unset).
export const createLogger = (): Logger =>
  pino({ level: optionalEnv('LOG_LEVEL') ?? 'info' }, pinoPretty({ colorize: !process.env.CI, sync: true, translateTime: 'SYS:HH:MM:ss' }));
