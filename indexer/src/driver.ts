// index.ts
import { Application, Router, RouterContext } from 'jsr:@oak/oak';
import { logger } from './api/middlewares/logger.ts';
import {
	addTagToEntry,
	Entry,
	getAllEntry,
	getAllTags,
	getEntry,
	initializeSQLite,
	insertEntry,
	insertTag,
} from './SQLite/SQLiteFuncs.ts';
import { newEntryUplaod } from './handleUpload.ts';
import { config } from '../config.ts';

const PORT = 3000;

// Create a new Oak application
const app = new Application();
const router = new Router();

initializeSQLite();

router.get('/tags', async (ctx) => {
	const tags = getAllTags();
	ctx.response.status = 200;
	ctx.response.body = tags;
	return;
});

router.post('/tag/:tagname', async (ctx) => {
	const tag = ctx.params.tagname;
	try {
		insertTag(tag);
		ctx.response.status = 201;
		ctx.response.headers.set('Location', `/tag/${tag}`);
		ctx.response.body = `Succesfully Added tag ${tag}`;
	} catch (err) {
		console.error(err);
		ctx.response.status = 500;
		ctx.response.body = `Could not add tag ${tag}`;
	}
});

router.post('/upload', async (ctx) => {
	const formDataBody = await ctx.request.body.formData();
	const file = formDataBody.get('file');

	if (!file || typeof file === 'string') {
		ctx.response.status = 400;
		ctx.response.body = `Must include a valid file`;
		return;
	}

	const desc = formDataBody.get('desc');
	const description = typeof desc === 'string' ? desc : undefined;
	const src = formDataBody.get('src');
	const source = typeof src === 'string' ? src : undefined;
	const t = formDataBody.get('tags');
	const tags = typeof t === 'string' ? t.split(',') : undefined;

	const p = formDataBody.get('password');
	const password = typeof p === 'string' ? p : '1234';

	const id = await newEntryUplaod(file, password, description, source, tags);
	console.log('id', id);

	ctx.response.status = 201;
	ctx.response.body = id;
	ctx.response.headers.set('Location', id);
});

type Ref = Entry & { link: string };
function formatRef(ctx: RouterContext<any, any, any>, entry: Entry): Ref {
	return {
		...entry,
		link: `${ctx.request.url.protocol}//${ctx.request.url.host}/media/${entry.guid}.${entry.fileType}`,
	};
}

router.get('/refs', async (ctx) => {
	const entries = getAllEntry();
	const outEntries: Ref[] = [];
	entries.forEach((entry) => {
		outEntries.push(formatRef(ctx, entry));
	});
	ctx.response.status = 200;
	ctx.response.body = outEntries;
});

router.get('/rand', async (ctx) => {
	const entries = getAllEntry();
	const outEntries: Ref[] = [];
	entries.forEach((entry) => {
		outEntries.push(formatRef(ctx, entry));
	});
	outEntries.sort(() => Math.random() - 0.5);
	ctx.response.status = 200;
	ctx.response.body = outEntries[0];
});

router.get('/ref/:refid', async (ctx) => {
	const refid = ctx.params.refid;
	const entry: Entry = getEntry(refid);
	ctx.response.status = 200;
	ctx.response.body = formatRef(ctx, entry);
});

router.get('/ref/addtag/:id/:tags', async (ctx) => {
	const tags = ctx.params.tags.split(',');
	const id = ctx.params.id;
	let resp = 'Added tags: [';
	tags.forEach((tag) => {
		try {
			addTagToEntry(id, tag);
		} catch (err) {
			if (typeof err === 'string') {
				ctx.response.status = 400;
				ctx.response.body = err;
			} else {
				ctx.response.status = 500;
				ctx.response.body = 'Failed for some reason';
			}
		}
		resp += tag;
	});
	resp += ']';
	ctx.response.status = 201;
	ctx.response.body = resp;
});

//media passthrough
router.get('/media/:filepath', async (ctx) => {
	const filepath = ctx.params.filepath;
	const extensionless = filepath.split('.')[0];
	const targetUrl = `${config.rawUrl}/file/${extensionless}`;

	const password = ctx.request.headers.get('password') ?? '1234';
	try {
		const response = await fetch(targetUrl, {
			headers: {
				password: password,
			},
		});
		if (!response.ok) {
			ctx.response.status = response.status;
			ctx.response.body = `Failed to fetch from upstream: ${response.statusText}`;
			return;
		}
		if (response.headers.has('content-type')) {
			ctx.response.headers.set('content-type', response.headers.get('content-type')!);
		}
		ctx.response.body = response.body;
	} catch (error) {
		console.error('Proxy error:', error);
		ctx.response.status = 500;
		ctx.response.body = 'Internal Server Error (Proxy failed)';
	}
});
0;
//Use Middlewares
app.use(logger);

// Use the router
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
console.log(`Server running at http://localhost:${PORT}`);
await app.listen({ port: PORT });
