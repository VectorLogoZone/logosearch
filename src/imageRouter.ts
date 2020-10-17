//import * as Handlebars from 'handlebars'
import KoaRouter from 'koa-router';
import Pino from 'pino';

import { t } from './i18n';
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

    router.prefix(`/${t("UI.IMAGE_PATH")}`);

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

router.get('/', async (ctx) => {
    ctx.status = 301;
    ctx.redirect('index.html');
});

router.get('/index.html', async (ctx) => {
    const values = Array.from(logoMap.values());
    values.sort(compareLogoDetail);

    const sourceList = sources.getSources();

    const flashHtml = t("IMAGES_PAGE.INFO_BOX_HTML", {
        imageCount: search.getImageCount(),
        numValues: top1K.length,
        singleSourceCount,
        sourceCount: sourceList.length,
        uniqueCount: logoMap.size,
    });

    await ctx.render('images/index.hbs', {
        flashHtml,
        title: t("IMAGES_PAGE.TITLE"),
        values: top1K,
    });
});

router.get('/:name/index.html', async (ctx) => {

    const logoDetail = logoMap.get(ctx.params.name);
    if (!logoDetail) {
        if (logoMap.get(slugify(ctx.params.name, ''))) {
            // prevent 404s from old links
            ctx.redirect(`/images/${slugify(ctx.params.name, '')}/index.html`);
            return;
        }
        return;
    }

    await ctx.render('images/_index.hbs', {
        description: t('IMAGE_PAGE.META_DESCRIPTION', { 
            imageCount: logoDetail.images.length,
            name: logoDetail.name
        }),
        logoDetail,
        title: t("IMAGE_PAGE.TITLE", { name: ctx.params.name } ),
    });
});

/*
 * legacy: because the search engines are spidering these URLs
 */
router.get('/:segment+/:name.svg', async (ctx) => {
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

    retVal.push(`/${t("UI.IMAGE_PATH")}/index.html`);

    for (const logoDetail of top1K) {
        retVal.push(`/${t("UI.IMAGE_PATH")}/${encodeURIComponent(logoDetail.name)}/index.html`);
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
