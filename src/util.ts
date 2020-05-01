import { Readable } from 'stream';
import * as tar from 'tar-stream';
import gunzip from 'gunzip-maybe';

import { config } from './config';

/*
 * add website (and eventually signature) to a logo URL
 */
function expandUrl(url:string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `${config.get('cdnPrefix')}${url}`;
}

function processTar(tarStream: Readable, callback: (name:string, buf: Buffer|null) => void ):void {

    var extract = tar.extract()

    extract.on('entry', function (header, stream, next) {
        // header is the tar header
        // stream is the content body (might be an empty stream)
        // call next when you are done with this entry
        streamToBuffer(stream).then((buf) => {
            callback(header.name, buf);
            next();
        });

        stream.on('end', function () {
            next() // ready for next entry
        })

        stream.resume() // just auto drain the stream
    })

    extract.on('finish', function () {
        // all entries read
        callback('EOF', null);
    })

    tarStream.pipe(gunzip()).pipe(extract);
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
    let onData: (data: Buffer) => void;
    let onError: (error: Error) => void;
    let onEnd: () => void;
    return new Promise<Buffer[]>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('end', (onEnd = () => resolve(chunks)));
        stream.on('error', (onError = reject));
        // adding a 'data' listener switches the stream to flowing mode
        stream.on('data', (onData = (data: Buffer) => chunks.push(data)));
    })
        .then(Buffer.concat)
        .finally(() => {
            stream.removeListener('data', onData);
            stream.removeListener('error', onError);
            stream.removeListener('end', onEnd);
        });
}

function toBoolean(value: any): boolean {

    switch (value) {
        case true:
        case "true":
        case 1:
        case "1":
        case "on":
        case "yes":
            return true;
        default:
            return false;
    }
}

export {
    expandUrl,
    processTar,
    streamToBuffer,
    toBoolean,
}