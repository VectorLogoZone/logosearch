import Axios from 'axios';
//import * as fs from 'fs';
import * as Handlebars from 'handlebars'
import KoaRouter from 'koa-router';
//import * as path from 'path';
import Pino from 'pino';

import { config } from './config';
import { t } from './i18n';
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

let imageCount = 0;

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
    const indexUrls = config.get('indexUrls').split(',');

    const promises:Promise<void>[] = [];

    for (const indexUrl of indexUrls) {
        promises.push(initOne(logger, indexUrl));
    }

    await Promise.all(promises);

    logger.debug({ millis: ((process.hrtime.bigint() - startTime) / BigInt(1e6)).toString() }, "index data loaded");

    sources.sort(function (a, b) {
        return a.name.localeCompare(b.name, "en", { sensitivity: "base"});
    });

    imageCount = sources.reduce((total, source) => total + source.images.length, 0);

    logger.info({
        imageCount,
        indexCount: indexUrls.length,
        millis: ((process.hrtime.bigint() - startTime) / BigInt(1e6)).toString(),
        sourceCount: sources.length
    }, "indexing complete");

    // needs to be done late so translations have been loaded
    router.get(`/sources/:handle/${t("COMMON.IMAGE_NAME_LC_plural")}.html`, async (ctx) => { await imagesPage(ctx, false); });
}

const axiosInstance = Axios.create({
    headers: {
        'User-Agent': `LogoSearch/1.0 (https://${t("UI.WEBSITE")}/`
    },
    responseType: 'stream',
    timeout: 60 * 1000,
});


async function initOne(logger: Pino.Logger, indexUrl:string):Promise<void> {

    const startTime = process.hrtime.bigint();

    logger.info({ indexUrl}, 'tar load starting');

    const response = await axiosInstance.get(indexUrl);

    return new Promise( (resolve, reject) => {
        let tarCount = 0;
        util.processTar(response.data, (name, buf) => {
            if (!buf) {
                sources.forEach( (source) => { sourceMap.set(source.handle, source); });
                logger.info({
                    indexUrl,
                    millis: ((process.hrtime.bigint() - startTime) / BigInt(1e6)).toString(),
                    tarCount }, "tar loaded");
                resolve();
                return;
            }
            tarCount += 1;
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
                }, 'source json loaded');
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
        total: imageCount,
        title: t('SOURCES_PAGE.TITLE')
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

router.get('/sources/:handle/unique.html', async (ctx) => { await imagesPage(ctx, true); });

async function imagesPage(ctx:any, unique:boolean) {

    const source = sourceMap.get(ctx.params.handle);
    if (!source) {
        return;
    }

    if (source.website) {
        ctx.set('Link', '<' + source.website + '>; rel="canonical"');
    }

    const preconnectURL = new URL(source.images[0].src);
    const preconnect = preconnectURL.origin;

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
        h1: new Handlebars.SafeString(`${unique ? "Unique " : ""}${t("COMMON.IMAGE_NAME_TC_plural")} in <a class="text-secondary" href="index.html">${Handlebars.escapeExpression(source.name)}</a>`),
        logos,
        maxPage,
        noindex: true,
        paging: maxPage > 1,
        preconnect: [ preconnect ],
        title: `${unique ? "Unique " : "" }${t("COMMON.IMAGE_NAME_TC_plural")} in ${source.name}`
    });
}

function getImageCount() {
    return imageCount;
}

function getSource(handle:string): SourceData|undefined {
    return sourceMap.get(handle);
}

function getSourceCount() {
    return sources.length;
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
    getImageCount,
    getSource,
    getSourceCount,
    getSources,
    getUrls,
    ImageInfo,
    init,
    router,
    SourceData
};

