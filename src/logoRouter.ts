import KoaRouter from 'koa-router';
import Pino from 'pino';

import * as search from './search';
import * as sources from './sources';
import { logger } from './logger';
import { slugify } from './util';

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
            const slugName = slugify(image.img, '');
            let logoDetail = logoMap.get(slugName);
            if (!logoDetail) {
                logoDetail = {
                    name: slugName,
                    images: []
                }
                logoMap.set(slugName, logoDetail);
            }
            logoDetail.images.push(image);
        }
    }
    const values = Array.from(logoMap.values()).sort(compareLogoDetail);
    top1K.push(...values.slice(0,1000));
    singleSourceCount = values.filter( ld => ld.images.length == 1).length,

    logger.info( { singleSourceCount, uniqueCount: logoMap.size }, 'Logo map initialized')
}

function isUnique(theImage:sources.ImageInfo): boolean {

    const theDetail = logoMap.get(slugify(theImage.img, ''));
    if (theDetail && theDetail.images.length == 1) {
        return true;
    }
    return false;
}

router.get('/logos/', async (ctx) => {
    ctx.redirect('index.html');
});

router.get('/logos/index.html', async (ctx) => {
    const values = Array.from(logoMap.values());
    values.sort(compareLogoDetail);

    const sourceList = sources.getSources();

    await ctx.render('logos/index.hbs', {
        imageCount: search.getImageCount(),
        singleSourceCount,
        sourceCount: sourceList.length,
        title: 'Most Common Logo Names',
        uniqueCount: logoMap.size,
        values: top1K,
    });
});

router.get('/logos/:name/index.html', async (ctx) => {

    const logoDetail = logoMap.get(ctx.params.name);
    if (!logoDetail) {
        if (logoMap.get(slugify(ctx.params.name, ''))) {
            // prevent 404s from old links
            ctx.redirect(`/logos/${slugify(ctx.params.name, '')}/index.html`);
            return;
        }
        return;
    }

    await ctx.render('logos/_index.hbs', {
        logoDetail,
        title: `${ctx.params.name} Logos`,
    });
});

/*
 * legacy: because the search engines are spidering these URLs
 */
router.get('/logos/:segment+/:name.svg', async (ctx) => {
    const segments = ctx.params.segment.split("/");
    const theSource = sources.getSource(segments[0]);
    if (!theSource) {
        return;
    }

    const path = segments.slice(1).join("/")
    const name = ctx.params.name;

    const localName = `${path}/${name}.svg`;

    logger.debug({ userAgent: ctx.request.headers['user-agent'], url: ctx.req.url, segments, path, name, localName }, "legacy url hit");

    const theImageInfo = theSource.images.find( (theImageInfo) => { return theImageInfo.name == name })
    if (!theImageInfo) {
        return;
    }

    ctx.redirect(theImageInfo.src);
});

function getUrls():string[] {
    const retVal:string[] = [];

    retVal.push("/logos/index.html");

    for (const logoDetail of top1K) {
        retVal.push(`/logos/${encodeURIComponent(logoDetail.name)}/index.html`);
    }

    return retVal;
}

export {
    getUrls,
    init,
    isUnique,
    router,
    compareLogoDetail,
};
