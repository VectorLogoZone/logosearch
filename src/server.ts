require('source-map-support').install(); // Required for using source-maps with logging

import * as fs from 'fs';
import * as Handlebars from 'handlebars'
import Koa from 'koa';
import KoaBody from 'koa-body';
//import KoaCompress from 'koa-compress';
import KoaRouter from 'koa-router';
import KoaStatic from 'koa-static';
import KoaViews from 'koa-views';
import * as os from 'os';
import * as path from 'path';
import * as pino from 'pino';
import pinoHttp from 'pino-http';

import * as alternatives from './alternatives';
import { config } from './config';
import * as i18n from './i18n';
import { logger } from './logger';
import * as imageRouter from './imageRouter';
import * as random from './random';
import * as schemaRouter from './schemaRouter';
import * as sources from './sources';
import * as search from './search';
import { sitemap } from './sitemap';
import { expandUrl, handleJsonp } from './util';

// import * as Yaml from 'js-yaml';

const app = new Koa();

logger.info( { config: JSON.parse(config.toString()) }, 'configuration loaded');

/*
 * hacked in directly from koa-pino-logger
 *
 * necessary since koa-pino-logger depends on an outdated version of pinoHttp
 */
function CustomPinoLogger(opts:any):any {
    var wrap:any = pinoHttp(opts)
    function pino(ctx:any, next:any) {
        wrap(ctx.req, ctx.res)
        ctx.log = ctx.request.log = ctx.response.log = ctx.req.log
        return next().catch(function (e:any) {
            ctx.log.error({
                res: ctx.res,
                err: {
                    type: e.constructor.name,
                    message: e.message,
                    stack: e.stack
                },
                responseTime: ctx.res.responseTime
            }, 'request errored')
            throw e
        })
    }
    pino.logger = wrap.logger
    return pino
}

const fastResponseMillis = config.get('fastResponseMillis');

app.use(CustomPinoLogger({
    logger,
    customLogLevel: function(res:any, err:unknown) {
        if (err) { return "error"; }
        const symbolOwner:any = pinoHttp;
        const startTime = res[symbolOwner.startTime];
        const responseTime = Date.now() - startTime;
        if (responseTime > fastResponseMillis) {
            return "warn";
        }
        return config.get('pageLogLevel') as pino.Level;
    }
}));

/*
 * hack because Google Cloud Viewer isn't the greatest.  Numbers are a bit lower than what pino thinks
 */
app.use(async(ctx, next) => {
    const start = process.hrtime.bigint();

    await next();

    const duration = (process.hrtime.bigint() - start) / 1000000n;

    if (duration > fastResponseMillis) {
        console.log(`WARNING: slow response for ${ctx.req.url}: ${duration}ms`);
    }
});

app.use(KoaBody({
    multipart: true,
  }));

const errTemplate = Handlebars.compile(
    fs.readFileSync(path.join(__dirname, '..', 'partials', 'above.hbs'), 'utf-8')
    + fs.readFileSync(path.join(__dirname, '..', 'views', '500.hbs'), 'utf-8')
    + fs.readFileSync(path.join(__dirname, '..', 'partials', 'below.hbs'), 'utf-8')
)

app.use(async(ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) {
            ctx.status = 404;
            if (ctx.path.endsWith('.json')) {
                ctx.body = { message: '404: invalid url', success: false, url: ctx.url };
            } else if (ctx.path.endsWith('.svg')) {
                ctx.type = 'image/svg+xml';
                ctx.body = fs.createReadStream(path.join(__dirname, '..', `static/common/images/404.svg`));
            } else {
                ctx.body = await ctx.render('404.hbs', { title: '404', h1: '404 - Page not found', url: ctx.req.url });
            }
        }
    } catch (err) {
        ctx.status = 500;
        logger.error( { err, path: ctx.request.path }, '500');
        //LATER: content-type aware
        ctx.body = await errTemplate({ title: 'Server Error', message: err.message });
    }
});

//app.use(KoaCompress({}));

app.use(KoaStatic(`static/${config.get('identity')}`, { maxage: 24 * 60 * 60 * 1000 }));
app.use(KoaStatic(`static/common`, { maxage: 24 * 60 * 60 * 1000 }));

app.use(KoaViews(path.join(__dirname, '..', 'views'), {
    autoRender: false,
    map: { hbs: 'handlebars' },
    options: {
        helpers: {
            'addCommas': function (num:number) {
                if (!num) {
                    num = 0;
                }
                return num.toLocaleString();
            },
            'dec': function (num:number) {
                return num - 1;
            },
            'equals': function(a:any, b:any, block:any) {
                return a == b ? block.fn() : block.inverse(this);
            },
            expandUrl,
            'for': function(from:number, to:number, incr:number, block:any) {
                let result = '';
                for (let loop = from; loop < to; loop += incr)
                    result += block.fn(loop);
                return result;
            },
            goat_counter_host: () => config.get('goatCounterHost'),
            'isPageVisible': function(page:number, currentPage:number, maxPage:number, block:any) {
                if (page<=3 || maxPage-page<=3 || Math.abs(currentPage - page) < 3) {
                    return block.fn();
                }
                return '.';
            },
            if_t: function(key:string, block:any) {      // if a translation exists
                const t = i18n.t(key);
                logger.trace({ key, t }, "if_t")
                if (t != "" && t != key) {
                    return block.fn();
                }
                return block.inverse(this);
            },
            'inc': function (num:number) {
                return num + 1;
            },
            'le': function(a:any, b:any, block:any) {
                return a <= b ? block.fn() : block.inverse(this);
            },
            t: i18n.t,
            toJson: function(context:any) { return JSON.stringify(context, null, 2); },
            providerIconUrl: function(provider:string, options:Handlebars.HelperOptions) {
                if (arguments.length < 2)
                    throw new Error("providerIconUrl helper needs 1 parameter");
                if (provider == 'github') {
                    return 'https://www.vectorlogo.zone/logos/github/github-icon.svg';
                } else if (provider == 'gitlab') {
                    return 'https://www.vectorlogo.zone/logos/gitlab/gitlab-icon.svg';
                } else if (provider == 'remote') {
                    return '/favicon.svg';  //LATER: better icon for remote sources
                } else {
                    return 'https://www.vectorlogo.zone/404.svg';
                }
            }
        },
        partials: {
            above: path.join(__dirname, '..', 'partials', 'above'),
            below: path.join(__dirname, '..', 'partials', 'below')
        }
    }
}));

app.use(async(ctx, next) => {

    ctx.state.build_id = config.get("buildId");

    await next();
});

app.use(sources.router.routes());
app.use(search.router.routes());
app.use(alternatives.router.routes());
app.use(random.router.routes());
app.use(imageRouter.router.routes());
app.use(schemaRouter.schemaRouter.routes());

const rootRouter = new KoaRouter();

rootRouter.get('/', search.searchGet);

rootRouter.get('/index.html', async (ctx) => {
    ctx.redirect('/');
});

rootRouter.get('/about.html', async (ctx:Koa.ExtendableContext) => {
    ctx.redirect('/faq.html');
});

rootRouter.get('/faq.html', async (ctx:Koa.ExtendableContext) => {
    ctx.body = await ctx.render('faq.hbs', { title: 'Frequently Asked Questions' });
});

rootRouter.get('/contact.html', async (ctx:Koa.ExtendableContext) => {
    ctx.body = await ctx.render('contact.hbs', { noindex: true, title: 'Contact' });
});

rootRouter.get('/robots.txt', async (ctx: Koa.ExtendableContext) => {
    ctx.body = await ctx.render('robots.hbs', {
        sources: sources.getSources()
    });
    ctx.set('Content-Type', 'text/plain; charset=UTF-8');
});

rootRouter.get('/sitemap.xml', sitemap);

rootRouter.get('/status.json', async (ctx) => {

    const retVal: {[key: string]: any} = {};

    retVal["success"] = true;
    retVal["message"] = "OK";
    retVal["timestamp"] = new Date().toISOString();
    retVal["tech"] = "NodeJS " + process.version;
    retVal["lastmod"] = process.env.LASTMOD || '(not set)';
    retVal["commit"] = process.env.COMMIT || '(not set)';
    retVal["sourcecount"] = sources.getSources().length;
    retVal["imagecount"] = search.getImageCount();
    retVal["__dirname"] = __dirname;
    retVal["__filename"] = __filename;
    retVal["os.hostname"] = os.hostname();
    retVal["os.type"] = os.type();
    retVal["os.platform"] = os.platform();
    retVal["os.arch"] = os.arch();
    retVal["os.release"] = os.release();
    retVal["os.uptime"] = os.uptime();
    retVal["os.loadavg"] = os.loadavg();
    retVal["os.totalmem"] = os.totalmem();
    retVal["os.freemem"] = os.freemem();
    retVal["os.cpus.length"] = os.cpus().length;
    // too much junk: retVal["os.networkInterfaces"] = os.networkInterfaces();

    retVal["process.arch"] = process.arch;
    retVal["process.cwd"] = process.cwd();
    retVal["process.execPath"] = process.execPath;
    retVal["process.memoryUsage"] = process.memoryUsage();
    retVal["process.platform"] = process.platform;
    retVal["process.release"] = process.release;
    retVal["process.title"] = process.title;
    retVal["process.uptime"] = process.uptime();
    retVal["process.version"] = process.version;
    retVal["process.versions"] = process.versions;

    handleJsonp(ctx, retVal)
});

app.use(rootRouter.routes());

async function main() {
    i18n.init(logger);
    await sources.init(logger);
    search.init(logger);
    alternatives.init(logger);
    random.init(logger, sources.getSources());
    imageRouter.init(logger);

    const port = config.get('port');

    app.listen(port);

    logger.info({ port: port }, 'server running');
}

main();
