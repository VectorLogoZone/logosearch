import KoaRouter from 'koa-router';

import * as fs from 'fs';
import * as path from 'path';
import Pino from 'pino';
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

router.get('/alternatives/', async (ctx) => {
    ctx.redirect('index.html');
});

router.get('/alternatives/index.html', async (ctx) => {
    await ctx.render('alternatives/index.hbs', { 
        alternatives, 
        title: 'Alternative Logo Sources' });
});

export { getAlternatives, init, router };