//import * as fs from 'fs';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import * as lunr from 'lunr';
//import * as path from 'path';
import Pino from 'pino';

import { config } from './config';
import * as sources from './sources';

type SearchHit = {
    url: string,
    description: string,
    source: string
};


let imageCount = 0;
let searchIndex: lunr.Index;

function init(logger:Pino.Logger) {


    searchIndex = new lunr.Index;

    searchIndex.ref('index');
    searchIndex.field('name');

    const dataSources = sources.getSources();
    for (let dataLoop = 0; dataLoop < dataSources.length; dataLoop++)
    {
        const images = dataSources[dataLoop].images;

        for (let imageLoop = 0; imageLoop < images.length; imageLoop++) {
            searchIndex.add({index: `${dataLoop}:${imageLoop}`, name: images[imageLoop].name});
            imageCount += 1;
        }
    }

    logger.info({ imageCount }, "Images indexed");
}

function getImageCount(): number {
    return imageCount;
}

function toBoolean(value:any):boolean {

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

const router = new KoaRouter();

router.get('/api/search.json', async (ctx) => {

    const retVal = doSearch(ctx);

    const callback = ctx.request.query['callback'];
    if (callback && callback.match(/^[$A-Za-z_][0-9A-Za-z_$]*$/) != null) {
        ctx.body = callback + '(' + JSON.stringify(retVal) + ');';
        ctx.set('Content-Type', 'text/javascript');
    } else {
        ctx.set('Access-Control-Allow-Origin', 'www.vectorlogo.zone,localhost');
        ctx.set('Access-Control-Allow-Methods', 'POST, GET');
        ctx.set('Access-Control-Max-Age', '604800');
        ctx.body = retVal;
    }
});

function doSearch(ctx:Koa.BaseContext):Object {

    let query = ctx.query['q'];

    if (!query) {
        return { success: false, message: 'Missing "q" parameter' };
    }

    let maxResults = 100;
    try {
        maxResults = Number(ctx.query['max'])
    } catch (err) {
        // do nothing
    }

    const prefix = config.get('cdnPrefix');

    let showRaw = false;
    try {
        showRaw = toBoolean(ctx.query['raw'])
    } catch (err) {
        // do nothing
    }

    let retVal:Object = {};
    try {
        let raw = searchIndex.search(query);
        /*if (raw.length == 0 && query.indexOf('*') == -1) {      //LATER: tweak lunr so this isn't necessary
            query = query + '*';
            raw = searchIndex.search(query);
        }*/
        if (!raw || raw.length == 0) {
            return { success: false, message: 'No matches' };
        }

        if (raw.length > maxResults) {
            raw = raw.slice(0, maxResults);
        }

        const cooked:SearchHit[] = [];
        const sourceData = sources.getSources();
        for (const result of raw) {
            const indices = result.ref.split(':');
            const source = sourceData[Number(indices[0])];
            const imageInfo = source.images[Number(indices[1])];
            let name = imageInfo.name;
            if (name.endsWith(".svg")) {
                name = name.slice(0, -4);
            }
            cooked.push({
                url: prefix + imageInfo.img,
                description: `${name} from ${source.name}`,
                source: imageInfo.src
            });
        }

        const body: any = { "success": true, "query": query, "results": cooked };
        if (showRaw) {
            body['raw'] = raw;
        }

        retVal = body;
    } catch (err) {
        retVal = {success: false, message: 'Query error!', err};
    }

    return retVal;
}

export { getImageCount, init, router, SearchHit };