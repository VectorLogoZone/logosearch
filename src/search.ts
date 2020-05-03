//import * as fs from 'fs';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import * as lunr from 'lunr';
//import * as path from 'path';
import Pino from 'pino';

import * as sources from './sources';
import { expandUrl } from './util';

type SearchHit = {
    css?: string,
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

const router = new KoaRouter();

router.get('/api/search.json', async (ctx) => {

    const retVal = doSearch(ctx);

    const callback = ctx.request.query['callback'];
    if (callback && callback.match(/^[$A-Za-z_][0-9A-Za-z_$]*$/) != null) {
        ctx.body = callback + '(' + JSON.stringify(retVal) + ');';
        ctx.set('Content-Type', 'text/javascript');
    } else {
        ctx.set('Access-Control-Allow-Origin', 'www.vectorlogo.zone,localhost');
        ctx.set('Access-Control-Allow-Methods', 'GET');
        ctx.set('Access-Control-Max-Age', '604800');
        ctx.body = retVal;
    }
    ctx.set("Cache-Control", "max-age=3600, public");
});



function doLunrSearch(ctx: Koa.BaseContext, query:string, maxResults:number):SearchHit[] {
    const cooked:SearchHit[] = [];
    let raw = searchIndex.search(query);
    /*if (raw.length == 0 && query.indexOf('*') == -1) {      //LATER: tweak lunr so this isn't necessary
        query = query + '*';
        raw = searchIndex.search(query);
    }*/
    if (!raw || raw.length == 0) {
        return cooked;
    }

    if (raw.length > maxResults) {
        raw = raw.slice(0, maxResults);
    }

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
            css: imageInfo.css,
            url: expandUrl(imageInfo.img),
            description: `${name} from ${source.name}`,
            source: imageInfo.src
        });
    }

    return cooked;
}

function doSimpleSearch(ctx: Koa.BaseContext, rawQuery: string, maxResults: number): SearchHit[] {
    const cooked: SearchHit[] = [];

    const source = sources.getSource("vlz-ar21");
    if (!source) {
        return cooked;
    }

    const query = rawQuery.toLowerCase();

    for (const imageInfo of source.images) {
        if (imageInfo.name.startsWith(query)) {
            cooked.push({
                css: imageInfo.css,
                description: `${imageInfo.name} from ${source.name}`,
                source: imageInfo.src,
                url: expandUrl(imageInfo.img),
            });
        }
        if (cooked.length >= maxResults) {
            break;
        }
    }

    return cooked;
}

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

    let retVal:Object = {};
    try {

        const cooked = /^[1a-z]$/i.test(query) 
            ? doSimpleSearch(ctx, query, maxResults)
            : doLunrSearch(ctx, query, maxResults)
            ;

        if (!cooked || cooked.length == 0) {
            return { success: false, message: `No matches for '${query}'` };
        }

 
        const body: any = { "success": true, "query": query, "results": cooked };

        retVal = body;
    } catch (err) {
        retVal = {success: false, message: `Query error ${err.message}`, err};
    }

    return retVal;
}

export { getImageCount, init, router, SearchHit };
