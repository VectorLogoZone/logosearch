/*
 * typescript isn't finding the correct additions to Koa's context
 */

import { ExtendableContext } from 'koa';
import { Logger } from 'pino';

declare module 'koa' {
    interface ExtendableContext {
        render(viewPath: string, locals?: any): Promise<void>;
        log: Logger;
    }
}
