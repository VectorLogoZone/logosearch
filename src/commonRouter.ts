import KoaRouter from 'koa-router';
import Pino from 'pino';

import * as sources from './sources';

const router = new KoaRouter();

type LogoDetail = {
    name:string,
    images:sources.ImageInfo[]
}

const stringCompare = new Intl.Collator('en').compare

function compareLogoDetail(a: LogoDetail, b:LogoDetail): number {
    if (a.images.length > b.images.length) {
        return -1;
    }
    if (a.images.length < b.images.length) {
        return 1;
    }
    return stringCompare(a.name, b.name);
}

const logoMap: Map<string, LogoDetail> = new Map();
const top1K:LogoDetail[] = [];
let singleSourceCount:number = -1;

async function init(logger:Pino.Logger):Promise<void> {

    for (const source of sources.getSources()) {
        for (const image of source.images) {
            if (!image.name) {
                logger.warn( { source: source.handle }, 'Invalid image name');
                continue;
            }
            let logoDetail = logoMap.get(image.name);
            if (!logoDetail) {
                logoDetail = {
                    name: image.name,
                    images: []
                }
                logoMap.set(image.name, logoDetail);
            }
            logoDetail.images.push(image);
        }
    }
    const values = Array.from(logoMap.values()).sort(compareLogoDetail);
    top1K.push(...values.slice(0,1000));
    singleSourceCount = values.filter( ld => ld.images.length == 1).length,

    logger.info( { singleSourceCount, uniqueCount: logoMap.size }, 'Logo map initialized')
}

router.get('/common/', async (ctx) => {
    ctx.redirect('index.html');
});

router.get('/common/index.html', async (ctx) => {
    const values = Array.from(logoMap.values());
    values.sort(compareLogoDetail);

    await ctx.render('common/index.hbs', {
        singleSourceCount,
        title: 'Most common names',
        uniqueCount: logoMap.size,
        values: top1K,
    });
});

router.get('/common/:name/index.html', async (ctx) => {

    const logoDetail = logoMap.get(ctx.params.name);
    if (!logoDetail) {
        return ctx.next();
    }

    await ctx.render('common/_index.hbs', {
        logoDetail,
        title: `${ctx.params.name} Logos`,
    });
});

function getUrls():string[] {
    const retVal:string[] = [];

    retVal.push("/common/index.html");

    for (const logoDetail of top1K) {
        retVal.push(`/common/${encodeURIComponent(logoDetail.name)}/index.html`);
    }

    return retVal;
}

export {
    getUrls,
    init,
    router,
    compareLogoDetail,
};