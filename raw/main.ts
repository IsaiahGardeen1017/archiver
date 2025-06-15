import { walk } from 'https://deno.land/std@0.170.0/fs/walk.ts';
import { deleteFile, getFile, getListOfFileInDir, saveFile } from './fileFuncs.ts';
import { getRandomInt } from './rando.ts';

const FILE_STORAGE_DIR = './volume-file-dir/';

Deno.serve(async (req) => {
	try {
		const url = new URL(req.url);
		console.log(`REQUEST - ${req.method} ${url.pathname}`);

		const urlParts = url.pathname.split('/');
		console.log(urlParts);

		if (req.method === 'GET') {
			if (urlParts[1] === 'file' && urlParts[2]) {
				return await handleReadFile(req, urlParts);
			}
			if (urlParts[1] === 'file') {
				return await handleSearchFiles(req);
			}
			if (urlParts[1] === 'rand') {
				return handleRand(req);
			}
		} else if (req.method === 'POST') {
			if (urlParts[1] === 'file') {
				return await handlePost(req);
			}
		} else if (req.method === 'DELETE') {
			if (urlParts[1] === 'file' && urlParts[2]) {
				const filepathToDelete = `${FILE_STORAGE_DIR}/${urlParts[2]}`;
				const errorMessage = await deleteFile(filepathToDelete);
				if (errorMessage) {
					return returnError(400, errorMessage);
				}
				return new Response('Deleted', { status: 200 });
			}
		}

		return returnError(400, 'Do not reognize url');
	} catch (err) {
		return returnError(500, 'Something bad happened');
	}
});

async function handleRand(req: Request): Promise<Response> {
	const possible = await getListOfFileInDir(FILE_STORAGE_DIR);
	if (possible.length === 0) {
		return returnError(404, 'No files present');
	}
	const fileName = possible[getRandomInt(possible.length - 1)];
	const data = await getFile(`${FILE_STORAGE_DIR}/${fileName}`);

	return new Response(data, {
		status: 200,
		headers: {
			'Location': `/file/${fileName}`,
		},
	});
}

async function handleReadFile(req: Request, urlParts: string[]): Promise<Response> {
	const fileId = urlParts[2];
	const filepath = FILE_STORAGE_DIR + fileId;

	const fileData = await getFile(filepath);
	if (!fileData) {
		//Search for similar and maybe redirect
		const matches = await getListOfFileInDir(FILE_STORAGE_DIR, fileId);
		if (matches.length === 1) {
			return new Response(undefined, {
				status: 301,
				headers: {
					'Location': `${matches[0]}`,
				},
			});
		} else if (matches.length === 0) {
			return returnError(404, 'Could not find file');
		} else {
			return returnError(
				404,
				JSON.stringify(
					{
						'errorMessage': `Could not find ${filepath}`,
						'possibleMatches': matches,
					},
					null,
					2,
				),
			);
		}
	}

	return new Response(fileData, {
		status: 200,
	});
}

async function handlePost(req: Request): Promise<Response> {
	if (req.body) {
		const uiarr = new Uint8Array(await (new Response(req.body)).arrayBuffer());
		const guid = await saveFile(FILE_STORAGE_DIR, uiarr);
		if (guid) {
			return new Response(guid, {
				status: 201,
			});
		}
		return returnError(500, 'Could not save file');
	}
	return returnError(400, 'No body provided');
}

async function handleSearchFiles(req: Request): Promise<Response> {
	const files = await getListOfFileInDir(FILE_STORAGE_DIR);

	return new Response(JSON.stringify(files, null, 2), {
		status: 200,
	});
}

function returnError(statusCode: number, message: string) {
	return new Response(message, {
		status: statusCode,
	});
}
