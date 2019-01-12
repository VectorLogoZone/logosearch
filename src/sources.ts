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
    provider_icon: string
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
        sources.push(sourceData);
    }
    logger.info({ sourceCount: sources.length }, "Sources loaded");
}

//import * as Yaml from 'js-yaml';
//const repos = Yaml.safeLoad(fs.readFileSync(path.join(__dirname, "..", "data", "gitrepos.yaml"), 'utf8'));

const router = new KoaRouter();

router.get('/sources/', async (ctx) => {
    ctx.redirect('index.html');
});

router.get('/sources/index.html', async (ctx) => {
    await ctx.render('sources/index.hbs', { sources, title: 'Sources' });
});

router.get('/sources/:handle/', async (ctx) => {
    ctx.redirect('index.html');
});

router.get('/sources/:handle/index.html', async (ctx) => {

    const filtered = sources.filter( (source:any) => { return source.handle === ctx.params.handle } );
    if (filtered.length === 1) {
        await ctx.render('sources/_index.hbs', {source: filtered[0], title: 'Source Info for ' + filtered[0].handle});
    }
});

router.get('/sources/:handle/logos.html', async (ctx) => {

    const filtered = sources.filter( (source:any) => { return source.handle === ctx.params.handle } );
    if (filtered.length === 1) {
        await ctx.render('sources/_logos.hbs', {source: filtered[0], title: 'Logos in ' + filtered[0].handle});
    }
});

function getSources() {
    return sources;
}

export { getSources, ImageInfo, init, router };