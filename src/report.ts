import * as KoaRouter from 'koa-router';

import * as fs from 'fs';
import * as path from 'path';
import * as Yaml from 'js-yaml';

const yamlData = Yaml.safeLoad(fs.readFileSync(path.join(__dirname, "..", "data", "repos.yaml"), 'utf8'));


const router = new KoaRouter();

router.get('/report/', async (ctx) => {
    await ctx.render('report/index.hbs', { repos: yamlData, title: 'Repositories' });
});

export { router };