//import * as fs from 'fs';
import * as Handlebars from 'handlebars'
import Koa from 'koa';
import KoaMount from 'koa-mount';
import KoaPinoLogger from 'koa-pino-logger';
import KoaRouter from 'koa-router';
import KoaStatic from 'koa-static';
import KoaViews from 'koa-views';
import * as os from 'os';
import * as path from 'path';
import Pino from 'pino';

import * as alternatives from './alternatives';
import * as sources from './sources';
import * as search from './search';
import * as random from './random';

// import * as Yaml from 'js-yaml';

const app = new Koa();

const logger = Pino();

app.use(KoaPinoLogger({ logger: logger }));

/*
app.use(async(ctx, next) => {
    const start = process.hrtime();

    await next();

    const duration = process.hrtime(start);

    console.log(`${ctx.req.url}: ${duration[0] * 1000 + duration[1] / 1e6} ns`);
});
*/
app.use(async(ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) {
            ctx.status = 404;
            await ctx.render('404.hbs', { title: '404', h1: '404 - Page not found', url: ctx.req.url });
        }
    } catch (err) {
        ctx.status = 500;
        await ctx.render('500.hbs', { title: 'Server Error', message: err.message });
    }
});

app.use(KoaStatic("static"));
app.use(KoaMount('/logos', KoaStatic("logos")));


app.use(KoaViews(path.join(__dirname, '..', 'views'), {
    map: { hbs: 'handlebars' },
    options: {
        helpers: {
            'addCommas': function (num:number) {
                return num.toLocaleString();
            },
            'equals': function(a:any, b:any, block:any) {
                return a == b ? block.fn() : '';
            },
            'for': function(from:number, to:number, incr:number, block:any) {
                let result = '';
                for (let loop = from; loop < to; loop += incr)
                    result += block.fn(loop);
                return result;
            },
            'isPageVisible': function(page:number, currentPage:number, maxPage:number, block:any) {
                if (page<=3 || maxPage-page<=3 || Math.abs(currentPage - page) < 3) {
                    return block.fn();
                }
                return '.';
            },
            toJson: function(context:any) { return JSON.stringify(context, null, 2); },
            providerIconUrl: function(provider:string, options:Handlebars.HelperOptions) {
                if (arguments.length < 2)
                    throw new Error("providerIconUrl helper needs 1 parameter");
                if (provider == 'github') {
                    return 'https://www.vectorlogo.zone/logos/github/github-icon.svg';
                } else if (provider == 'gitlab') {
                    return 'https://www.vectorlogo.zone/logos/gitlab/gitlab-icon.svg';
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

app.use(sources.router.routes());
app.use(search.router.routes());
app.use(alternatives.router.routes());
app.use(random.router.routes());

const rootRouter = new KoaRouter();

rootRouter.get('/', async (ctx) => {
    await ctx.render('index.hbs', { h1: 'Awesome Logos', sources: sources.getSources(), title: 'Awesome Logos' });
});

rootRouter.get('/index.html', async (ctx) => {
    await ctx.redirect('/');
});

rootRouter.get('/search.html', async (ctx) => {
    await ctx.render('index.hbs', { sources: sources.getSources(), title: 'SVG Logo Search' });
});

rootRouter.get('/about.html', async (ctx) => {
    await ctx.redirect('/faq.html');
});

rootRouter.get('/faq.html', async (ctx) => {
    await ctx.render('faq.hbs', { title: 'Frequently Asked Questions' });
});

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

    const callback = ctx.request.query['callback'];
    if (callback && callback.match(/^[$A-Za-z_][0-9A-Za-z_$]*$/) != null) {
        ctx.body = callback + '(' + JSON.stringify(retVal) + ');';
    } else {
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', 'POST, GET');
        ctx.set('Access-Control-Max-Age', '604800');
        ctx.body = JSON.stringify(retVal);
    }
});

app.use(rootRouter.routes());

sources.init(logger);
search.init(logger);
alternatives.init(logger);
random.init(logger, sources.getSources());

const port = parseInt(process.env.PORT || '4000');

app.listen(port);

logger.info({ port: port }, 'server running');