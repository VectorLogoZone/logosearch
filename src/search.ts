//import * as fs from 'fs';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import * as lunr from 'lunr';
//import * as path from 'path';
import Pino from 'pino';

import { config } from './config';
import * as goatcounter from './goatcounter';
import { t } from './i18n';
import * as sources from './sources';
import { getRandomLogos } from './random';
import { expandUrl, safeParseInt, slugify } from './util';

type SearchHit = {
    css?: string,
    url: string,
    description: string,
    source: string
};

const DEFAULT_MAX = 48;

let imageCount = 0;
let searchIndex: lunr.Index;

function init(logger:Pino.Logger) {

    const startTime = process.hrtime.bigint();

    searchIndex = new lunr.Index;

    searchIndex.ref('index');
    searchIndex.field('name');

    const dataSources = sources.getSources();
    for (let dataLoop = 0; dataLoop < dataSources.length; dataLoop++)
    {
        const images = dataSources[dataLoop].images;

        for (let imageLoop = 0; imageLoop < images.length; imageLoop++) {
            searchIndex.add({index: `${dataLoop}:${imageLoop}`, name: slugify(images[imageLoop].name, ' ') });
            imageCount += 1;
        }
    }

    logger.info({
        imageCount,
        millis: ((process.hrtime.bigint() - startTime) / BigInt(1e6)).toString()
    }, "Images indexed");
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

router.get('/search.html', searchGet);

async function searchGet(ctx: Koa.ParameterizedContext<any, KoaRouter.IRouterParamContext<any, {}>>) {
    const q = ctx.request.query.q;
    const max = ctx.request.query.max ? safeParseInt(ctx.request.query.max, DEFAULT_MAX) : DEFAULT_MAX;

    let results:SearchHit[] = [];
    if (q) {
        results = doSearchLow(q, max);
        goatcounter.track(ctx, `Search for '${q}': ${results.length} (querystring)`);
    } else {
        results = getRandomLogos(max);
    }
    ctx.body = await ctx.render('search.hbs', {
        canonical: '/search.html',
        DEFAULT_MAX,
        description: t('SEARCH_PAGE.META_DESCRIPTION', { imageCount: sources.getImageCount(), sourceCount: sources.getSourceCount() }),
        h1: t('SEARCH_PAGE.H1'),
        max,
        preconnect: [ 'https://raw.githubusercontent.com', 'https://gitlab.svg.zone', 'https://www.vectorlogo.zone', 'https://upload.wikimedia.org' ],
        q,
        results,
        rootMeta: true,
        title: t('SEARCH_PAGE.TITLE'),
    });
}

function doLunrSearch(query:string, maxResults:number):SearchHit[] {
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

function doSimpleSearch(rawQuery: string, maxResults: number): SearchHit[] {
    const cooked: SearchHit[] = [];

    const source = sources.getSource(config.get('simpleSearchSource'));
    if (!source) {
        return cooked;
    }

    const queryLower = rawQuery.toLowerCase();
    const queryUpper = rawQuery.toUpperCase();

    for (const imageInfo of source.images) {
        if (imageInfo.name.startsWith(queryLower) || imageInfo.name.startsWith(queryUpper)) {
            cooked.push({
                css: imageInfo.css,
                description: `${imageInfo.name} from ${source.name}`,
                source: imageInfo.src,
                url: expandUrl(imageInfo.img),
            });
        } /* else {
            console.log(`name=${imageInfo.name}: ${JSON.stringify(imageInfo)}`);
        } */
        if (cooked.length >= maxResults) {
            break;
        }
    }

    return cooked;
}

function doSearch(ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>):Object {

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

        const cooked = doSearchLow(query, maxResults+1);
        goatcounter.track(ctx, `Search for '${query}': ${cooked.length} (api)`);


        if (!cooked || cooked.length == 0) {
            return { success: false, message: `No matches for '${query}'` };
        }
        let more = false;
        if (cooked.length > maxResults) {
            more = true;
            cooked.pop();
        }


        const body: any = { "success": true, more, "query": query, "results": cooked };

        retVal = body;
    } catch (err) {
        retVal = {success: false, message: `Query error ${err.message}`, err};
    }

    return retVal;
}

function doSearchLow(query:string, maxResults: number):SearchHit[] {

    const cooked = /^[1a-z]$/i.test(query)
        ? doSimpleSearch(query, maxResults)
        : doLunrSearch(query, maxResults)
        ;

    return cooked;
}

export {
    DEFAULT_MAX,
    getImageCount,
    init,
    router,
    searchGet,
    SearchHit
};
