import * as fs from 'fs';
import * as KoaRouter from 'koa-router';
import * as lunr from 'lunr';
import * as path from 'path';
import * as Pino from 'pino';

type ImageInfo = {
    name: string,
    img: string,
    src: string
};

type RepoData = {
    id: string,
    commit: string,
    lastmodified: string,
    images: ImageInfo[]
}

const baseDir = path.join(__dirname, "..", "logos");
let searchData: ImageInfo[] = [];
let searchIndex: lunr.Index;

function load(logger:Pino.Logger) {

    const ArrFileName = fs.readdirSync(baseDir);
    for (const fileName of ArrFileName) {
        if (fileName.endsWith(".json") == false) {
            continue;
        }
        const repoData: RepoData = JSON.parse(fs.readFileSync(path.join(baseDir, fileName), 'utf8'));
        searchData = searchData.concat(repoData.images);
    }
    logger.info({ imagecount: searchData.length }, "Search data loaded");

    searchIndex = lunr(function () {
        this.ref('index');
        this.field('name');

        for (let loop = 0; loop < searchData.length; loop++) {
            this.add({index: loop, name: searchData[loop].name});
        }
    });
}

function getImageCount(): number {
    return searchData.length;
}

function getSearchData (id:string): RepoData {
    const repoData: RepoData = JSON.parse(fs.readFileSync(path.join(baseDir, id + ".json"), 'utf8'));

    repoData.images.sort((left:ImageInfo, right:ImageInfo):number => {
        if (left.name < right.name) { return -1; }
        if (left.name > right.name) { return 1; }
        return 0;
    });

    return repoData;
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

    try {
        let raw = searchIndex.search(query);
        if (raw.length == 0 && query.indexOf('*') == -1) {      //LATER: tweak lunr so this isn't necessary
            query = query + '*';
            raw = searchIndex.search(query);
        }
        const cooked:ImageInfo[] = [];
        for (const result of raw) {
            cooked.push(searchData[Number(result.ref)]);
        }
        ctx.body = {success: true, query, raw: raw, results: cooked };
    } catch (err) {
        ctx.body = {success: false, message: 'Not ready yet!', err};
    }
});

export { getImageCount, load, router, getSearchData };