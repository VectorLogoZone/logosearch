import * as KoaRouter from 'koa-router';

import * as fs from 'fs';
import * as path from 'path';
import * as Pino from 'pino';
import * as Yaml from 'js-yaml';

type AlternativeData = {
    handle: string,
    name: string,
    search: string,
    home: string,
    enabled: boolean
}


let alternatives:AlternativeData[] = [];


function init(logger:Pino.Logger) {

    alternatives = Yaml.safeLoad(fs.readFileSync(path.join(__dirname, "..", "data", "alternatives.yaml"), 'utf8'));

    logger.info({ alternativeCount: alternatives.length }, "Alternatives loaded");
}

function getAlternatives() {
    return alternatives;
}


const router = new KoaRouter();

router.get('/not-awesome/', async (ctx) => {
    ctx.redirect('index.html');
});

router.get('/not-awesome/index.html', async (ctx) => {
    await ctx.render('alternatives/index.hbs', { alternatives, h1: 'Not-quite-so-awesome Logo Sources', title: 'Alternative Logo Sources' });
});

export { getAlternatives, init, router };