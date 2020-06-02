import axios from 'axios';
import Koa from 'koa';

import { config } from './config';
import { getCurrentIP } from './util';
import { logger } from './logger';


const client = axios.create({
    timeout: 2500,
});

async function middleware(ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>, next: Koa.Next) {
    try {
        await next();
        if (!config.get('goatCounterHost')) {
            return;
        }
        if (ctx.path.startsWith("/images")
            || ctx.path.startsWith("/js")
            || ctx.path.startsWith("/css")
            || ctx.path.startsWith("/favicon")) {
            return;
        }
        track(ctx);
    } catch (err) {
        logger.error({ err }, "GoatCounter middleware error");
    }
}

async function track(ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>, title?:string): Promise<void> {
    try
    {
        if (!config.get('goatCounterHost')) {
            return;
        }
        
        client.get(`https://${config.get('goatCounterHost')}/count`, {
                params: {
                p: ctx.path,
                q: ctx.querystring,
                r: ctx.headers['referrer'] || ctx.headers['referer'],
                t: title,
            },
            timeout: 2500,
            headers: {
                'user-agent': ctx.headers['user-agent'] || 'Mozilla/5.0 NoUserAgent/1.0',
                'X-Forwarded-For': getCurrentIP(ctx)
            },
            validateStatus: function (status) {
                return true;
            }
        })
        .then((response) => { logger.trace({ params: response.config.params, headers: response.headers, url: ctx.request.originalUrl, statusCode: response.status, statusText: response.statusText, responseData: response.data }, "GoatCounter hit logged"); })
        .catch((err) => { logger.error({ err }, "GoatCounter post error"); })
        ;
    } catch (err) {
        logger.error( { err }, "GoatCounter track error");
    }
}

export {
    middleware,
    track
}

