import Pino from 'pino';

import { config } from './config';

const logger = Pino({
    level: config.get('logLevel'),
    name: config.get('identity'),
    timestamp: () => `,"time":"${new Date().toISOString()}"`
});

export { logger }

