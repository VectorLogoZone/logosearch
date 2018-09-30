
import * as Koa from 'koa';

const app = new Koa();


app.use( async (ctx: Koa.Context) => {
    ctx.body = 'Hello World!';
});

app.listen(4000);

console.log('Server running on port 4000');