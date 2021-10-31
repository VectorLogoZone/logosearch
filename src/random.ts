import KoaRouter from 'koa-router';

import Pino from 'pino';

import { config } from './config';
import * as Sources from './sources';
import { DEFAULT_MAX, SearchHit } from './search';
import { expandUrl } from './util';

let randomSources:Sources.SourceData[] = [];


function init(logger:Pino.Logger, sources: Sources.SourceData[]) {

    const randomConfig = config.get("randomSources");
    if (randomConfig) {
        const randomSet = new Set<string>();
        randomConfig.split(',').forEach(x => randomSet.add(x));
        for (const theSource of sources) {
            if (randomSet.has(theSource.handle)) {
                randomSources.push(theSource);
            }
        }
    } else {
        for (const theSource of sources) {
            if (theSource.images.length > 400) {
                randomSources.push(theSource);
            }
        }
    }

    if (randomSources.length == 0) {
        logger.fatal( { randomConfig }, "No random sources found");
        process.exit(1);
    }

    logger.info({ randomSourceCount: randomSources.length }, "Random sources found");
}

const router = new KoaRouter();

router.get('/api/', async (ctx) => {
    ctx.redirect('https://github.com/VectorLogoZone/logosearch#api');
});

router.get('/api/index.html', async (ctx) => {
    ctx.redirect('https://github.com/VectorLogoZone/logosearch#api');
});

function getRandomInt(max:number): number {
    return Math.floor(Math.random() * Math.floor(max));
}

function getRandomLogo(): Sources.ImageInfo {
    const theSource = randomSources[getRandomInt(randomSources.length)];
    const theImageInfo = theSource.images[getRandomInt(theSource.images.length)];

    return theImageInfo;
}

function getRandomLogos(max:number): SearchHit[] {
    const results = new Set<SearchHit>();
    while (results.size < max) {
        const theSource = randomSources[getRandomInt(randomSources.length)];
        const theImageInfo = theSource.images[getRandomInt(theSource.images.length)];
        let name = theImageInfo.name;
        if (name.endsWith(".svg")) {
            name = name.slice(0, -4);
        }
        const cooked:SearchHit = {
            url: expandUrl(theImageInfo.img),
            css: theImageInfo.css,
            description: `${name} from ${theSource.name}`,
            source: theImageInfo.src
        };
        results.add(cooked);
    }
    return Array.from(results);
}
router.get('/api/random.json', async (ctx) => {

    ctx.body = { "success": true, "query": "*", "results": getRandomLogos(DEFAULT_MAX) };
});

export { getRandomLogo, getRandomLogos, init, router };
