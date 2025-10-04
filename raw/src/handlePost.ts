import { saveFile } from '../fileFuncs.ts';
import { FILE_STORAGE_DIR, returnError } from '../main.ts';
import { encrypt } from './crypto.ts';

export async function handlePost(req: Request, password: string): Promise<Response> {
	if (req.body) {
		const uiarr = new Uint8Array(await (new Response(req.body)).arrayBuffer());
		const encrpted = await encrypt(uiarr, password);
		const guid = await saveFile(FILE_STORAGE_DIR, encrpted);
		if (guid) {
			return new Response(guid, {
				status: 201,
			});
		}
		return returnError(500, 'Could not save file');
	}
	return returnError(400, 'No body provided');
}
