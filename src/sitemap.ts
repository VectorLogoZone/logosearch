import * as imageRouter from './imageRouter';
import * as sources from './sources';

async function sitemap(ctx:any) {

    let urls:string[] = [];

    urls.push(...imageRouter.getUrls());
    urls.push(...sources.getUrls());

    // hard-coded to avoid circular dependencies
    urls.push("/search.html");
    urls.push("/faq.html");

    urls.sort();

    await ctx.render('sitemap.hbs', { urls });
    ctx.type = "text/xml;charset=utf-8";
}

export {
    sitemap
}