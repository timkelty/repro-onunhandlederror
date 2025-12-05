# `onUnhandledError` Not Working with `@cloudflare/vitest-pool-workers`

The `onUnhandledError` callback in Vitest is not invoked when using `@cloudflare/vitest-pool-workers`.

## Steps to Reproduce

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the test:
   ```bash
   npm test
   ```

3. Observe: The `onUnhandledError` callback in `vitest.config.ts` is never invoked (no `❌ onUnhandledError callback was invoked!` logs appear).

## Expected vs Actual

**Expected:** `onUnhandledError` callback is invoked when unhandled rejections occur, allowing filtering of expected errors.

**Actual:** Callback is never invoked, preventing per-test error filtering.

## Workaround

Use `dangerouslyIgnoreUnhandledErrors` (cannot be scoped to specific tests):

```bash
vitest run --dangerouslyIgnoreUnhandledErrors
```

## Related Issue

[GitHub Issue #11532](https://github.com/cloudflare/workers-sdk/issues/11532)
