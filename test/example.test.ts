import { fetchMock, SELF } from "cloudflare:test";
import { beforeAll, expect, test } from "vitest";

beforeAll(() => {
	fetchMock.activate();
	fetchMock.disableNetConnect();
});

test("Demonstrates onUnhandledError not being called", async () => {
	console.log("🧪 Starting test that will cause unhandled rejection...");
	console.log("This test uses fetchMock.replyWithError() which causes unhandled rejections");
	console.log("that should be caught by the onUnhandledError callback in vitest.config.ts");
	
	const interceptor = fetchMock
		.get("https://example.com")
		.intercept({ path: "/" });

	// First call will reject with an error (causes unhandled rejection)
	interceptor.replyWithError(new Error("Expected network error"));
	// Second call will succeed (simulating retry logic)
	interceptor.reply(200, "success");

	// The fetch will fail first, then retry and succeed
	// But Vitest sees the first rejection as unhandled
	const response = await SELF.fetch("https://example.com/test");

	expect(response.status).toBe(200);
	expect(await response.text()).toBe("success");
	
	console.log("✅ Test passed!");
	console.log("Check the output above for unhandled rejection errors.");
	console.log("If onUnhandledError callback was invoked, you should see:");
	console.log("  '❌ onUnhandledError callback was invoked!'");
	console.log("If you don't see that message, the callback is NOT being called (the bug).");
});
