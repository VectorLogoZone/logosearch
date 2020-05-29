import { default as convict } from 'convict';

const config = convict({
  buildId: {
    default: process.env.COMMIT || `local@${new Date().getTime()}`,
    doc: 'Unique Build ID (commit hash or timestamp) for cache busting',
    env: 'BUILD_ID',
    format: String
  },
  fastResponseMillis: {
    default: 250,
    doc: 'responses that take longer than this are logged as "warn" (in millis)',
    env: 'FAST_RESPONSE_MILLIS',
    format: 'int'
  },
  goatCounterHost: {
    default: undefined,
    doc: 'GoatCounter hostname',
    env: 'GOAT_COUNTER_HOST',
    format: String
  },
  googleAnalyticsId: {
    default: '',
    doc: 'Google Analytics ID (UA-XXXXX-XX)',
    env: 'GOOGLE_ANALYTICS_ID',
    format: String,
  },
  logLevel: {
    default: 'debug',
    doc: 'pino logging level [fatal, error, warn, info, debug, trace]',
    env: 'LOG_LEVEL',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
  },
  pageLogLevel: {
    default: 'trace',
    doc: 'log level for request logging (since production has separate page logging)',
    env: 'PAGELOG_LEVEL',
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
    doc: 'Random key for encrypting session (not currently used)',
    env: 'SESSION_KEY',
    format: String,
    sensitive: true,
  },
  indexUrls: {
    default: "https://www.vectorlogo.zone/util/sourceData.tgz,https://github.com/VectorLogoZone/wikipedia-svg-logos/releases/latest/download/sourceData.tgz",
    doc: 'URLs of logo indices (comma separated)',
    env: 'INDEX_URLS',
    format: String,
  },
});

export { config };
