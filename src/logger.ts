import Pino from 'pino';

import { config } from './config';

const logger = Pino({
    level: config.get('logLevel'),
    name: process.env.npm_package_name,
    timestamp: () => `,"time":"${new Date().toISOString()}"`
});

export { logger }

