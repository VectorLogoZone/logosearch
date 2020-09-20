import * as fs from 'fs';
import i18next from 'i18next';
import * as path from 'path';
import Pino from 'pino';

import { config } from './config';

function init(logger: Pino.Logger) {

    const resources = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", config.get('identity'), "translations.json"), 'utf8'));

    i18next.init({
        debug: false,
        fallbackLng: 'en',
        initImmediate: false,
        interpolation: {
            format: function(value, format, lng) {
                if (format === 'addCommas') return Number(value).toLocaleString();
                return value;
            }
        },
        lng: 'en',
        preload: [ 'en' ],
        resources,
        });
    logger.info({
        language: i18next.language,
        languages: i18next.languages,
        keys: Object.keys(resources),
    }, 'Translations loaded');
}

function t(key:string, options?:any):string {
    return i18next.t(key, options);
}

export {
    init,
    t,
}
