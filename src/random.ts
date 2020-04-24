import KoaRouter from 'koa-router';

import Pino from 'pino';

import { config } from './config';
import * as Sources from './sources';
import { SearchHit } from './search';

let randomSources:Sources.SourceData[] = [];


function init(logger:Pino.Logger, sources: Sources.SourceData[]) {

    for (const theSource of sources) {
        if (theSource.images.length > 400) {
            randomSources.push(theSource);
        }
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

router.get('/api/random.json', async (ctx) => {

    const prefix = config.get('cdnPrefix');

    const results = new Set<SearchHit>();
    while (results.size < 48) {
        const theSource = randomSources[getRandomInt(randomSources.length)];
        const theImageInfo = theSource.images[getRandomInt(theSource.images.length)];
        let name = theImageInfo.name;
        if (name.endsWith(".svg")) {
            name = name.slice(0, -4);
        }
        const cooked:SearchHit = {
            url: prefix + theImageInfo.img,
            description: `${name} from ${theSource.name}`,
            source: theImageInfo.src
        };
        results.add(cooked);
    }

    ctx.body = { "success": true, "query": "*", "results": Array.from(results) };
});

export { getRandomLogo, init, router };