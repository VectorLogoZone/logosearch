import { default as convict } from 'convict';

const config = convict({
  cdnPrefix: {
    default: '/cache/',
    doc: 'Prefix (possibly including hostname) where images are stored',
    env: 'CDN_PREFIX',
    format: String
  },
  logLevel: {
    default: 'debug',
    doc: 'pino logging level [fatal, error, warn, info, debug, trace]',
    env: 'LOG_LEVEL',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
  },
  port: {
    default: 4000,
    doc: 'TCP port at which this service listens',
    env: 'PORT',
    format: 'int',
  },
  sessionKey: {
    default: 'hu0P7u9cXHsdZTJMd3riwOelHtYmZuVo',
    doc: 'Random key for encrypting session',
    env: 'SESSION_KEY',
    format: String,
    sensitive: true,
  },
});

export { config };
