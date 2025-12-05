# Minimal Reproduction: `onUnhandledError` Not Working with `@cloudflare/vitest-pool-workers`

This repository demonstrates that the `onUnhandledError` callback in Vitest is not invoked when using `@cloudflare/vitest-pool-workers`.

## Steps to Reproduce

### 1. Install Dependencies

```bash
npm install
```

### 2. Examine the Configuration

Open `vitest.config.ts` and note that it contains an `onUnhandledError` callback with detailed logging:

```typescript
onUnhandledError(error) {
  console.log("❌ onUnhandledError callback was invoked!");
  console.log("Error:", error);
  // ... more logging
  if (message === "Expected network error") {
    console.log("✅ Filtering out expected error");
    return false;
  }
}
```

### 3. Run the Test

```bash
npm test
```

### 4. Observe the Output

**Expected Behavior:**
- If `onUnhandledError` was working, you would see console logs:
  - `❌ onUnhandledError callback was invoked!`
  - `Error: [error object]`
  - `✅ Filtering out expected error`

**Actual Behavior:**
- The test runs and passes
- **No logs from `onUnhandledError` callback appear**
- The callback function is never invoked
- This demonstrates the bug: `onUnhandledError` is not called with `@cloudflare/vitest-pool-workers`

### 5. Verify the Callback Should Be Called

To confirm the callback should be invoked, you can temporarily cause an unhandled rejection that Vitest will definitely report:

1. Modify `test/example.test.ts` to add this at the end:
   ```typescript
   // Force an unhandled rejection
   Promise.reject(new Error("Expected network error"));
   await new Promise(resolve => setTimeout(resolve, 100));
   ```

2. Run `npm test` again
3. You'll see Vitest report the unhandled rejection
4. **But still no logs from `onUnhandledError` callback**
5. This confirms the callback is not being invoked even when errors are reported

### 6. Compare with Standard Vitest

To verify this is specific to `@cloudflare/vitest-pool-workers`, you can:

1. Temporarily change `vitest.config.ts` to use standard Vitest config:
   ```typescript
   import { defineConfig } from "vitest/config";
   
   export default defineConfig({
     test: {
       onUnhandledError(error) {
         console.log("❌ onUnhandledError callback was invoked!");
         // ... same callback
       },
     },
   });
   ```

2. Remove the `poolOptions` section
3. Run `npm test`
4. With standard Vitest, the callback **will** be invoked (demonstrating the issue is specific to the Workers pool)

## What This Demonstrates

1. The `onUnhandledError` callback is properly configured in `vitest.config.ts` with detailed logging
2. The test uses `fetchMock.replyWithError()` which can cause unhandled rejections in the worker context
3. The `p-retry` library handles retries correctly (test passes)
4. **However**, when unhandled rejections occur, the `onUnhandledError` callback is never invoked
5. This prevents developers from filtering out expected errors on a per-test basis
6. The issue is specific to `@cloudflare/vitest-pool-workers` (works fine with standard Vitest)

## Workaround

The only current workaround is to use `dangerouslyIgnoreUnhandledErrors`:

```bash
vitest run --dangerouslyIgnoreUnhandledErrors
```

However, this:
- Cannot be scoped to specific tests
- Still shows errors in output (only prevents test failures)
- May mask legitimate errors in other tests

## Related Issue

See: [GitHub Issue #XXXXX](https://github.com/cloudflare/workers-sdk/issues/XXXXX)

## Files

- `vitest.config.ts` - Contains the `onUnhandledError` callback that should be invoked but isn't
- `test/example.test.ts` - Test that demonstrates the issue
- `src/index.ts` - Simple worker that uses `p-retry` for fetch calls
