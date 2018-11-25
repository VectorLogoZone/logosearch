import * as KoaRouter from 'koa-router';

//import * as fs from 'fs';
//import * as path from 'path';

const router = new KoaRouter();

router.get('/api/', async (ctx) => {
    ctx.redirect('search.json');
});

router.get('/api/search.json', async (ctx) => {
    ctx.body = { success: false, message: 'Not ready yet!'} ;
});

export { router };