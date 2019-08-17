import * as Koa from 'koa'

const app = new Koa();

app.use((ctx) => {
    console.log('welcome');
    ctx.body = 'hello world!!!';
});

app.listen(process.env.PORT || 3000);