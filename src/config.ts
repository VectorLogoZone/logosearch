import { default as convict } from 'convict';

const config = convict({
  cdnPrefix: {
    default: 'http://localhost:4001/',
    doc: 'Prefix (possibly including hostname) where images are stored, including trailing slash',
    env: 'CDN_PREFIX',
    format: String
  },
  minio: {
    accessKey: {
      doc: 'Minio accessKey',
      env: 'MINIO_ACCESSKEY',
      format: String
    },
    bucket: {
      doc: 'Minio bucket',
      env: 'MINIO_BUCKET',
      format: String
    },
    enabled: {
      default: false,
      doc: 'use Minio to created signed URLs',
      env: 'MINIO_ENABLED',
      format: 'Boolean'
    },
    endPoint: {
      doc: 'Minio endpoint',
      env: 'MINIO_ENDPOINT',
      format: String
    },
    secretKey: {
      doc: 'Minio secretKey',
      env: 'MINIO_ENDPOINT',
      format: String
    },
    port: {
      doc: 'Minio port',
      env: 'MINIO_PORT',
      format: 'int'
    }
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
  indexPath: {
    default: "sourceData.tgz",
    doc: 'path of logo index (on CDN, not including the leading slash)',
    env: 'INDEX_PATH',
    format: String,
  },
});

export { config };
