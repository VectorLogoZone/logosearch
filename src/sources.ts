import * as KoaRouter from 'koa-router';

import * as fs from 'fs';
import * as path from 'path';
import * as Pino from 'pino';

type ImageInfo = {
    name: string,
    img: string,
    src: string
};

type SourceData = {
    data: any,
    handle: string,
    images: ImageInfo[]
    lastmodified: string,
    name: string,
    provider: string,
    provider_icon: string,
    url: string,
    website?: string,
    logo?: string
}

const baseDir = path.join(__dirname, "..", "logos");
let sources:SourceData[] = [];

function is_dir(path:string) {
    try {
        var stat = fs.lstatSync(path);
        return stat.isDirectory();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
    }
}

function is_file(path:string) {
    try {
        var stat = fs.lstatSync(path);
        return stat.isFile();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
    }
}

function init(logger:Pino.Logger) {

    const ArrFileName = fs.readdirSync(baseDir);
    for (const fileName of ArrFileName) {
        if (is_dir(path.join(baseDir, fileName)) == false) {
            logger.trace({ fileName }, 'Skipping file');
            continue;
        }

        const dataName = path.join(baseDir, fileName, 'sourceData.json');
        if (is_file(dataName) == false) {
            logger.trace( { dataName }, "File is missing");
            continue;
        }

        const sourceData: SourceData = JSON.parse(fs.readFileSync(dataName, 'utf8'));
        sourceData.images.sort(function(a, b) {
            if (a.name > b.name) { return 1; }
            if (a.name < b.name) { return -1; }
            return 0;
        });
        sources.push(sourceData);
    }
    logger.info({ sourceCount: sources.length }, "Sources loaded");
}

//import * as Yaml from 'js-yaml';
//const repos = Yaml.safeLoad(fs.readFileSync(path.join(__dirname, "..", "data", "gitrepos.yaml"), 'utf8'));

const router = new KoaRouter();

router.get('/awesome/', async (ctx) => {
    ctx.redirect('index.html');
});

router.get('/awesome/index.html', async (ctx) => {
    await ctx.render('sources/index.hbs', { sources, title: 'Awesome Logo Sources' });
});

router.get('/awesome/:handle/', async (ctx) => {
    ctx.redirect('index.html');
});

router.get('/awesome/:handle/index.html', async (ctx) => {

    const filtered = sources.filter( (source:any) => { return source.handle === ctx.params.handle } );
    if (filtered.length === 1) {
        await ctx.render('sources/_index.hbs', {source: filtered[0], title: 'Source Info for ' + filtered[0].handle});
    }
});

router.get('/awesome/:handle/logos.html', async (ctx) => {

    const filtered = sources.filter( (source:any) => { return source.handle === ctx.params.handle } );
    if (filtered.length !== 1) {
        return;
    }

    if (filtered[0].website) {
        ctx.set('Link', '<' + filtered[0].website + '>; rel="canonical"');
    }

    const all = filtered[0].images;
    let pageSize = 25;
    if ("pagesize" in ctx.query) {
        pageSize = Number(ctx.query['pagesize']);
    }
    let currentPage = 1;
    if ("page" in ctx.query) {
        currentPage = Number(ctx.query['page']);
    }
    let maxPage = all.length / pageSize;
    if (all.length % pageSize > 0) {
        maxPage += 1;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }
    if (currentPage > maxPage) {
        currentPage = maxPage;
    }
    const logos = all.slice((currentPage - 1) * pageSize, (currentPage * pageSize));
    await ctx.render('sources/_logos.hbs', {currentPage, logos, maxPage, title: 'Logos in ' + filtered[0].handle});
});

function getSources() {
    return sources;
}

export { getSources, ImageInfo, init, router };