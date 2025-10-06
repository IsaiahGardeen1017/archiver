// routes/api/[...path].ts
import { Handlers } from '$fresh/server.ts';
import { config } from '../../config.ts';

// Define your backend server's base URL
const BACKEND_BASE_URL = config.indexerUrl;

export const handler: Handlers = {
	async GET(req, ctx) {
		return proxyRequest(req, ctx);
	},
	async POST(req, ctx) {
		return proxyRequest(req, ctx);
	},
	async PUT(req, ctx) {
		return proxyRequest(req, ctx);
	},
	async DELETE(req, ctx) {
		return proxyRequest(req, ctx);
	},
	async PATCH(req, ctx) {
		return proxyRequest(req, ctx);
	},
	// Add other methods like OPTIONS if needed
};

async function proxyRequest(req: Request, ctx: unknown): Promise<Response> {
	const url = new URL(req.url);
	const path = url.pathname.replace('/api', ''); // Remove the /api prefix

	// Construct the new URL for the backend
	const backendUrl = new URL(BACKEND_BASE_URL + path + url.search);

	try {
		const headers = new Headers(req.headers);
		headers.set('password', 'kitfisto');
		// Remove the Host header as it might cause issues with some backend servers
		// when proxying, as it refers to the Fresh server's host.
		headers.delete('host');

		// Important: if you have cookies that should be forwarded to the backend,
		// ensure they are copied here. However, be mindful of security and same-site policies.

		// If the original request has a body (POST, PUT, PATCH), forward it
		let body: ReadableStream | null = null;
		if (
			req.method === 'POST' || req.method === 'PUT' ||
			req.method === 'PATCH'
		) {
			body = req.body;
		}

		const backendResponse = await fetch(backendUrl.toString(), {
			method: req.method,
			headers: headers,
			body: body,
			// You might need to adjust other fetch options like credentials, redirect, etc.
		});

		// Create a new response from the backend's response
		const proxyResponse = new Response(backendResponse.body, {
			status: backendResponse.status,
			statusText: backendResponse.statusText,
			headers: backendResponse.headers,
		});

		// Optionally, you might want to modify some headers before sending back to the client
		// For example, if your backend sets cookies, you might want to re-set them
		// or modify their `domain` attribute if they are for the Fresh domain.

		return proxyResponse;
	} catch (error) {
		console.error('Proxy error:', error);
		return new Response(`Proxy error: ${(error as any)?.message}`, {
			status: 500,
		});
	}
}
