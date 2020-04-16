import * as minio from 'minio';

import { config } from './config';

let minioClient:minio.Client|undefined;

async function getSignedUrl(base:string):Promise<string> {

    if (!config.get('minio.enabled')) {
        return `${config.get('cdnPrefix')}${base}`;
    }

    if (!minioClient) {
         minioClient = new minio.Client({
             endPoint: config.get('minio.endPoint'),
             secretKey: config.get('minio.secretKey'),
             accessKey: config.get('minio.accessKey'),
         });
    }

    return minioClient.presignedUrl(
        'GET',
        config.get('minio.bucket'),
        base,
        24 * 60 * 60
    );
}


export { 
    getSignedUrl,
}