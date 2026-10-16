# `@istima/test-utils`

Shared Jest test helpers for `@istima/*` packages. Internal to the workspace; not published.

## What's here

- `istimaErrorMatchers` - Jest custom matchers that understand the `IstimaError` hierarchy from `@istima/types`.
  - `expect(value).toBeIstimaError(code?)` - asserts the value is a `IstimaError` (optionally with a specific `ErrorCode`).
- `registerIstimaMatchers()` - one-call helper that calls `expect.extend(istimaErrorMatchers)`. Use it in a Jest setup file.

## Usage

In a feature-package test:

```ts
import {registerIstimaMatchers} from '@istima/test-utils';
import {IstimaAudioError} from '@istima/types';

beforeAll( => registerIstimaMatchers());

test('rejects malformed source',  => {
  const err = new IstimaAudioError('AUDIO_SOURCE_INVALID', 'bad uri', {
    recoverable: false,
  });
  expect(err).toBeIstimaError('AUDIO_SOURCE_INVALID');
  expect(err).toBeIstimaError; // no code: just asserts IstimaError-ness
});
```

For consumers that want it registered globally, point Jest's `setupFilesAfterEach` at a one-line setup file:

```js
// jest.setup.ts
import {registerIstimaMatchers} from '@istima/test-utils';
registerIstimaMatchers;
```

```js
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEach: ['<rootDir>/jest.setup.ts'],
};
```

## Scope rules

This package is for **test-only helpers consumed by 2+ packages**. Don't put production code here.

Adding new matchers / mocks: bump `0.x.y → 0.x.y+1` for additions, `0.x → 0.(x+1)` for breaking signature changes, until first stable adoption (then 1.0). Same versioning convention as `@istima/types` per [RFC-002](../../docs/rfcs/002-istima-types-package.md).
