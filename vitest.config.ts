import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
	test: {
		onUnhandledError(error) {
			console.log("❌ onUnhandledError callback was invoked!");
			console.log("Error:", error);
			console.log("Error type:", (error as any).type);
			console.log("Error keys:", Object.keys(error as any));
			
			const errorObj = error instanceof Error ? error : (error as any).reason || error;
			const message = errorObj?.message || String(errorObj);
			
			if (message === "Expected network error") {
				console.log("✅ Filtering out expected error");
				return false;
			}
		},
		poolOptions: {
			workers: {
				singleWorker: true,
				main: "./src/index.ts",
				wrangler: {
					configPath: undefined,
				},
			},
		},
	},
});
