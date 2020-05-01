import * as axios from 'axios';
//import * as fs from 'fs';
import * as Handlebars from 'handlebars'
import KoaRouter from 'koa-router';
//import * as path from 'path';
import Pino from 'pino';

import { config } from './config';
import * as util from './util';
import { isUnique } from './logoRouter';

type ImageInfo = {
    css?: string,
    name: string,
    img: string,
    src: string
};

type SourceData = {
    css?: string,
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

let sources: SourceData[] = [];
const sourceMap: Map<string, SourceData> = new Map();

/*
const baseDir = path.join(__dirname, "..", "logos");

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
*/

async function init(logger:Pino.Logger) {

    const startTime = process.hrtime.bigint();

    const indexUrl = util.expandUrl(config.get('indexPath'))
    logger.info({ url: indexUrl}, 'Index URL');

    const response = await axios.default.get(indexUrl, {
        responseType: 'stream'
    });

    return new Promise( (resolve, reject) => {
        util.processTar(response.data, (name, buf) => {
            if (!buf) {
                sources.forEach( (source) => { sourceMap.set(source.handle, source); });
                logger.info({ 
                    millis: ((process.hrtime.bigint() - startTime) / BigInt(1e6)).toString(),
                    sourceCount: sources.length }, "Sources loaded");
                resolve();
            }
            if (!buf) { return; }
            const sourceData: SourceData = JSON.parse(buf.toString());
            sourceData.images.sort(function (a, b) {
                if (a.name > b.name) { return 1; }
                if (a.name < b.name) { return -1; }
                return 0;
            });
            if (sourceData.data && sourceData.data.css) {
                sourceData.images.forEach((theImageData) => { theImageData.css = sourceData.data.css; })
            }
            sources.push(sourceData);
            logger.trace( { 
                    bytes: buf ? buf.length : '-1', 
                    imageCount: sourceData.images.length,
                    fileNameInTar: name, 
                }, 'Single source loaded');
        });
    });
/*
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
        if (sourceData.data.css) {
            sourceData.images.forEach((theImageData) => { theImageData.css = sourceData.data.css;} )
        }
        sources.push(sourceData);
    }
    logger.info({ sourceCount: sources.length }, "Sources loaded");
    */
}

//import * as Yaml from 'js-yaml';
//const repos = Yaml.safeLoad(fs.readFileSync(path.join(__dirname, "..", "data", "sources.yaml"), 'utf8'));

const router = new KoaRouter();

router.get('/sources/', async (ctx) => {
    ctx.redirect('index.html');
});

router.get('/sources/index.html', async (ctx) => {
    await ctx.render('sources/index.hbs', {
        sources,
        total: sources.reduce((total, source) => total + source.images.length, 0),
        title: 'Logo Sources'
    });
});

router.get('/sources/:handle/', async (ctx) => {
    ctx.redirect('index.html');
});

router.get('/sources/:handle/index.html', async (ctx) => {

    const source = sourceMap.get(ctx.params.handle);
    if (source) {
        await ctx.render('sources/_index.hbs', {
            source,
            title: `Source Info for ${source.handle}`,
            uniqueCount: source.images.filter( (ii) => isUnique(ii) ).length
        });
    }
});

router.get('/sources/:handle/logos.html', async (ctx) => { await logosPage(ctx, false); });

router.get('/sources/:handle/unique.html', async (ctx) => { await logosPage(ctx, true); });


async function logosPage(ctx:any, unique:boolean) {

    const source = sourceMap.get(ctx.params.handle);
    if (!source) {
        return;
    }

    if (source.website) {
        ctx.set('Link', '<' + source.website + '>; rel="canonical"');
    }

    let all = source.images;
    if (unique) {
        all = all.filter((ii) => isUnique(ii));
    }
    let pageSize = 180;
    if ("pagesize" in ctx.query) {
        pageSize = Number(ctx.query['pagesize']);
    }
    if (pageSize > 720) {
        pageSize = 720;
    }

    let currentPage = 1;
    if ("page" in ctx.query) {
        currentPage = Number(ctx.query['page']);
    }
    let maxPage = Math.trunc(all.length / pageSize);
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
    await ctx.render('sources/_logos.hbs', {
        currentPage,
        h1: new Handlebars.SafeString(`${unique ? "Unique " : ""}Logos in <a class="text-secondary" href="index.html">${Handlebars.escapeExpression(source.name)}</a>`),
        logos,
        maxPage,
        noindex: true,
        paging: maxPage > 1,
        title: `${unique ? "Unique " : "" }Logos in ${source.name}`
    });
}

function getSource(handle:string): SourceData|undefined {
    return sourceMap.get(handle);
}

function getSources() {
    return sources;
}

function getUrls():string[] {
    const retVal:string[] = [];

    retVal.push("/sources/index.html");

    for (const source of sources) {
        retVal.push(`/sources/${encodeURIComponent(source.handle)}/index.html`);
    }

    return retVal;
}

export {
    getSource,
    getSources,
    getUrls,
    ImageInfo,
    init,
    router,
    SourceData
};