import type {ErrorCode} from '@istima/types';
import {IstimaError} from '@istima/types';

/**
 * Jest custom matchers for the `IstimaError` hierarchy.
 *
 * Use `registerIstimaMatchers()` to install them, or pass `istimaErrorMatchers`
 * directly to `expect.extend(...)`.
 */
export const istimaErrorMatchers = {
  toBeIstimaError(
    this: jest.MatcherContext,
    received: unknown,
    code?: ErrorCode,
  ): jest.CustomMatcherResult {
    if (!(received instanceof IstimaError)) {
      return {
        pass: false,
        message: () =>
          `expected value to be a IstimaError, got ${this.utils.printReceived(
            received,
          )}`,
      };
    }

    if (code !== undefined && received.code !== code) {
      return {
        pass: false,
        message: () =>
          `expected IstimaError with code ${this.utils.printExpected(
            code,
          )}, got code ${this.utils.printReceived(received.code)}`,
      };
    }

    return {
      pass: true,
      message: () =>
        code !== undefined
          ? `expected value not to be a IstimaError with code ${this.utils.printExpected(
              code,
            )}`
          : `expected value not to be a IstimaError`,
    };
  },
};

/** Install the matchers on Jest's `expect`. Call once per test file or in a setup file. */
export function registerIstimaMatchers(): void {
  expect.extend(istimaErrorMatchers);
}

// Augment Jest's matcher types so consumers get autocomplete + type-checking.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeIstimaError(code?: ErrorCode): R;
    }
    interface Expect {
      toBeIstimaError(code?: ErrorCode): unknown;
    }
    interface InverseAsymmetricMatchers {
      toBeIstimaError(code?: ErrorCode): unknown;
    }
  }
}
