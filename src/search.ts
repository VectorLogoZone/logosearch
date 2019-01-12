//import * as fs from 'fs';
import * as KoaRouter from 'koa-router';
import * as lunr from 'lunr';
//import * as path from 'path';
import * as Pino from 'pino';

import * as sources from './sources';

type SearchHit = {
    url: string,
    description: string,
    source: string
};


let searchData: sources.ImageInfo[] = [];
let searchIndex: lunr.Index;

function init(logger:Pino.Logger) {


    searchIndex = new lunr.Index;

    searchIndex.ref('index');
    searchIndex.field('name');

    const dataSources = sources.getSources();
    let count = 0;
    for (let dataLoop = 0; dataLoop < dataSources.length; dataLoop++)
    {
        const images = dataSources[dataLoop].images;

        for (let imageLoop = 0; imageLoop < images.length; imageLoop++) {
            searchIndex.add({index: `${dataLoop}:${imageLoop}`, name: images[imageLoop].name});
            count += 1;
        }
    }

    logger.info({ imageCount: count }, "Images indexed");
}

function getImageCount(): number {
    return searchData.length;
}
/*
function getSearchData (id:string): RepoData {
    const repoData: RepoData = JSON.parse(fs.readFileSync(path.join(baseDir, id + ".json"), 'utf8'));

    repoData.images.sort((left:ImageInfo, right:ImageInfo):number => {
        if (left.name < right.name) { return -1; }
        if (left.name > right.name) { return 1; }
        return 0;
    });

    return repoData;
}
*/

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

router.get('/api/', async (ctx) => {
    ctx.redirect('search.json');
});

router.get('/api/search.json', async (ctx) => {

    let query = ctx.query['q'];
    if (!query) {
        ctx.body = { success: false, message: 'Missing "q" parameter' };
        return;
    }

    let maxResults = 100;
    try {
        maxResults = Number(ctx.query['max'])
    } catch (err) {
        // do nothing
    }

    let absoluteUrls = false;
    try {
        absoluteUrls = toBoolean(ctx.query['absolute'])
    } catch (err) {
        // do nothing
    }
    const prefix = absoluteUrls ? "https://search.vectorlogo.zone/logos/" : "/logos/";

    let showRaw = false;
    try {
        showRaw = toBoolean(ctx.query['raw'])
    } catch (err) {
        // do nothing
    }
    try {
        let raw = searchIndex.search(query);
        /*if (raw.length == 0 && query.indexOf('*') == -1) {      //LATER: tweak lunr so this isn't necessary
            query = query + '*';
            raw = searchIndex.search(query);
        }*/
        if (!raw || raw.length == 0) {
            ctx.body = { success: false, message: 'No matches' };
            return;
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

        ctx.body = body;
    } catch (err) {
        ctx.body = {success: false, message: 'Query error!', err};
    }
});

export { getImageCount, init, router };