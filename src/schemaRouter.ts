import { File } from 'formidable';
import { promises as fsPromises } from 'fs';
//import * as Handlebars from 'handlebars'
import IsMyJsonValid from 'is-my-json-valid';
import KoaRouter from 'koa-router';
import * as path from 'path';
import Pino from 'pino';

//import { t } from './i18n';
import { logger } from './logger';

const schemaRouter = new KoaRouter();

let schema:string|null = null;

async function loadSchema(logger:Pino.Logger):Promise<string> {
    return await fsPromises.readFile(path.join(__dirname, '../schemas/sourceData.schema.json'), 'utf-8');
}

schemaRouter.get('/schema/', async (ctx) => {
    ctx.status = 301;
    ctx.redirect('index.html');
});

schemaRouter.get('/schema/index.html', async (ctx) => {

    ctx.body = await ctx.render('schema/index.hbs', {
        title: "Schema Test",
    });
});

schemaRouter.post('/schema/index.html', async (ctx) => {

    if (!ctx.request.files || !ctx.request.files.file) {
        //LATER: flash, then ctx.redirect('index.html');
        throw new Error('You need to send a file to test!')
        return;
    }
    const file = ctx.request.files.file as File;

    const jsonData = await fsPromises.readFile(file.path, 'utf-8');

    if (schema == null) {
        schema = await loadSchema(logger);
    }

    const validate = IsMyJsonValid(JSON.parse(schema), {
        greedy: true,
        //verbose: true,
      });

    validate(JSON.parse(jsonData));
    ctx.body = validate.errors;
});

function getUrls():string[] {
    const retVal:string[] = [];

    retVal.push(`/schema/index.html`);

    return retVal;
}

export {
    getUrls,
    schemaRouter,
};
