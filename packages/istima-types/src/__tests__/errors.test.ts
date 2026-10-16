import {
  IstimaError,
  IstimaAudioError,
  IstimaMushafError,
  IstimaLifecycleError,
  IstimaNetworkError,
} from '../errors';

describe('IstimaError', () => {
  describe('construction', () => {
    it('captures code, recoverable, message, and frozen context', () => {
      const err = new IstimaError('AUDIO_LOAD_FAILED', 'load failed', {
        recoverable: true,
        context: {url: 'https://example.invalid/track.mp3'},
      });

      expect(err.code).toBe('AUDIO_LOAD_FAILED');
      expect(err.recoverable).toBe(true);
      expect(err.message).toBe('load failed');
      expect(err.context).toEqual({url: 'https://example.invalid/track.mp3'});
      expect(Object.isFrozen(err.context)).toBe(true);
    });

    it('defaults context to an empty frozen object when omitted', () => {
      const err = new IstimaError('PRECONDITION_VIOLATED', 'no player', {
        recoverable: false,
      });

      expect(err.context).toEqual({});
      expect(Object.isFrozen(err.context)).toBe(true);
    });

    it('preserves a cause via options.cause', () => {
      const cause = new TypeError('bad uri');
      const err = new IstimaError('AUDIO_SOURCE_INVALID', 'invalid source', {
        recoverable: false,
        cause,
      });

      expect(err.cause).toBe(cause);
    });

    it('does not retain a reference to the caller-provided context object', () => {
      const ctx = {surahId: 42} as Record<string, unknown>;
      const err = new IstimaError('AUDIO_PLAYBACK_FAILED', 'failed', {
        recoverable: true,
        context: ctx,
      });

      // Mutating the original object must not change the error's context.
      ctx.surahId = 99;
      expect(err.context).toEqual({surahId: 42});
    });
  });

  describe('Error inheritance', () => {
    it('is an instance of Error and IstimaError', () => {
      const err = new IstimaError('AUDIO_LOAD_FAILED', 'x', {
        recoverable: true,
      });
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(IstimaError);
    });

    it('preserves a stack trace', () => {
      const err = new IstimaError('AUDIO_LOAD_FAILED', 'x', {
        recoverable: true,
      });
      expect(typeof err.stack).toBe('string');
      expect(err.stack ?? '').toContain('Error');
    });
  });
});

describe('Domain subclasses', () => {
  it('all extend IstimaError and Error', () => {
    const audio = new IstimaAudioError('AUDIO_LOAD_FAILED', 'a', {
      recoverable: true,
    });
    const mushaf = new IstimaMushafError('MUSHAF_DB_NOT_FOUND', 'm', {
      recoverable: false,
    });
    const lifecycle = new IstimaLifecycleError('LIFECYCLE_AFTER_DESTROY', 'l', {
      recoverable: false,
    });
    const network = new IstimaNetworkError('NETWORK_TIMEOUT', 'n', {
      recoverable: true,
    });

    for (const err of [audio, mushaf, lifecycle, network]) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(IstimaError);
    }
  });

  it('have the right name property for each subclass', () => {
    expect(
      new IstimaAudioError('AUDIO_LOAD_FAILED', 'x', {recoverable: true}).name,
    ).toBe('IstimaAudioError');
    expect(
      new IstimaMushafError('MUSHAF_DB_NOT_FOUND', 'x', {recoverable: false})
        .name,
    ).toBe('IstimaMushafError');
    expect(
      new IstimaLifecycleError('LIFECYCLE_AFTER_DESTROY', 'x', {
        recoverable: false,
      }).name,
    ).toBe('IstimaLifecycleError');
    expect(
      new IstimaNetworkError('NETWORK_TIMEOUT', 'x', {recoverable: true}).name,
    ).toBe('IstimaNetworkError');
  });

  it('lets consumers branch on instanceof for each domain', () => {
    const errs = [
      new IstimaAudioError('AUDIO_LOAD_FAILED', 'a', {recoverable: true}),
      new IstimaMushafError('MUSHAF_DB_NOT_FOUND', 'm', {recoverable: false}),
      new IstimaLifecycleError('LIFECYCLE_AFTER_DESTROY', 'l', {
        recoverable: false,
      }),
      new IstimaNetworkError('NETWORK_TIMEOUT', 'n', {recoverable: true}),
    ] as const;

    expect(errs[0]).toBeInstanceOf(IstimaAudioError);
    expect(errs[0]).not.toBeInstanceOf(IstimaMushafError);

    expect(errs[1]).toBeInstanceOf(IstimaMushafError);
    expect(errs[1]).not.toBeInstanceOf(IstimaAudioError);

    expect(errs[2]).toBeInstanceOf(IstimaLifecycleError);
    expect(errs[2]).not.toBeInstanceOf(IstimaNetworkError);

    expect(errs[3]).toBeInstanceOf(IstimaNetworkError);
    expect(errs[3]).not.toBeInstanceOf(IstimaLifecycleError);
  });
});
