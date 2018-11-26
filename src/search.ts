import * as KoaRouter from 'koa-router';

import * as fs from 'fs';
import * as path from 'path';

//import repos as RepoList from './repos';

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

let searchData: ImageInfo[] = [];

const baseDir = path.join(__dirname, "..", "logos");

const ArrFileName = fs.readdirSync(baseDir);
for (const fileName of ArrFileName) {
    if (fileName.endsWith(".json") == false) {
        continue;
    }
    const repoData: RepoData = JSON.parse(fs.readFileSync(path.join(baseDir, fileName), 'utf8'));
    searchData = searchData.concat(repoData.images);
    console.log("INFO: repodata for " + fileName);
}
console.log("INFO: # images=" + searchData.length);

function getSearchData (id:string): RepoData {
    const repoData: RepoData = JSON.parse(fs.readFileSync(path.join(baseDir, id + ".json"), 'utf8'));

    return repoData;
}

const router = new KoaRouter();

router.get('/api/', async (ctx) => {
    ctx.redirect('search.json');
});

router.get('/api/search.json', async (ctx) => {
    ctx.body = { success: false, message: 'Not ready yet!'} ;
});

export { router, getSearchData };