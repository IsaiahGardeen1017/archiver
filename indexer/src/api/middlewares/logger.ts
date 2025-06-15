import { Context } from 'jsr:@oak/oak';

export async function logger(ctx: Context, next: () => Promise<unknown>) {
	console.log(`${ctx.request.method} ${ctx.request.url}`);

	const type = await ctx.request.body.type();
	if (ctx.request.method !== 'GET' && type === 'json') {
		const body = await ctx.request.body.json();
		body ? console.log(body) : console.log('No body');
	}
	await next();
}
