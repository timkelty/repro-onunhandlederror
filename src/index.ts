import pRetry from "p-retry";

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		
		// If this is a test request, use p-retry to fetch (simulating retry logic)
		if (url.pathname === "/test") {
			const response = await pRetry(
				async () => {
					return await fetch("https://example.com/");
				},
				{
					retries: 2,
					minTimeout: 10,
				}
			);
			return response;
		}
		
		return new Response("Hello World");
	},
};
