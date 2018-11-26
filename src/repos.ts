import * as KoaRouter from 'koa-router';

import * as fs from 'fs';
import * as path from 'path';
import * as Yaml from 'js-yaml';

import { getSearchData } from './search';

const repos = Yaml.safeLoad(fs.readFileSync(path.join(__dirname, "..", "data", "repos.yaml"), 'utf8'));

const router = new KoaRouter();

router.get('/repo/', async (ctx) => {
    ctx.redirect('index.html');
});

router.get('/repo/index.html', async (ctx) => {
    await ctx.render('repo/index.hbs', { repos, title: 'Repositories' });
});

router.get('/repo/:repo/', async (ctx) => {
    ctx.redirect('index.html');
});

router.get('/repo/:repo/index.html', async (ctx) => {

    const filtered = repos.filter( (repo:any) => { return repo.id === ctx.params.repo } );
    if (filtered.length === 1) {
        const searchData = getSearchData(filtered[0].id);
        await ctx.render('repo/_index.hbs', {repo: filtered[0], searchData, title: 'Repository Info for ' + filtered[0].id});
    }
});

router.get('/repo/:repo/logos.html', async (ctx) => {

    const filtered = repos.filter( (repo:any) => { return repo.id === ctx.params.repo } );
    if (filtered.length === 1) {
        const searchData = getSearchData(filtered[0].id);
        await ctx.render('repo/_logos.hbs', {repo: filtered[0], searchData, title: 'Logos in ' + filtered[0].id});
    }
});
export { repos, router };