//import * as fs from 'fs';
import * as KoaRouter from 'koa-router';
import * as lunr from 'lunr';
//import * as path from 'path';
import * as Pino from 'pino';

import * as sources from './sources';



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

    try {
        let raw = searchIndex.search(query);
        /*if (raw.length == 0 && query.indexOf('*') == -1) {      //LATER: tweak lunr so this isn't necessary
            query = query + '*';
            raw = searchIndex.search(query);
        }*/
        const cooked:sources.ImageInfo[] = [];
        if (raw && raw.length) {
            const sourceData = sources.getSources();
            for (const result of raw) {
                const indices = result.ref.split(':');
                cooked.push(sourceData[Number(indices[0])].images[Number(indices[1])]);
            }
        }
        ctx.body = {success: true, query, raw: raw, results: cooked };
    } catch (err) {
        ctx.body = {success: false, message: 'Not ready yet!', err};
    }
});

export { getImageCount, init, router };