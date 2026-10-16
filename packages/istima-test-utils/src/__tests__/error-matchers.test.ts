import {
  IstimaAudioError,
  IstimaError,
  IstimaMushafError,
  IstimaNetworkError,
} from '@istima/types';
import {registerIstimaMatchers} from '../error-matchers';

beforeAll(() => {
  registerIstimaMatchers();
});

describe('toBeIstimaError', () => {
  describe('without a code argument', () => {
    it('passes for any IstimaError', () => {
      const err = new IstimaError('AUDIO_LOAD_FAILED', 'load failed', {
        recoverable: true,
      });
      expect(err).toBeIstimaError();
    });

    it('passes for any IstimaError subclass', () => {
      expect(
        new IstimaAudioError('AUDIO_LOAD_FAILED', 'a', {recoverable: true}),
      ).toBeIstimaError();
      expect(
        new IstimaMushafError('MUSHAF_DB_NOT_FOUND', 'm', {recoverable: false}),
      ).toBeIstimaError();
      expect(
        new IstimaNetworkError('NETWORK_TIMEOUT', 'n', {recoverable: true}),
      ).toBeIstimaError();
    });

    it('fails for plain Error', () => {
      const err = new Error('boom');
      expect(err).not.toBeIstimaError();
    });

    it('fails for non-Error values', () => {
      expect('AUDIO_LOAD_FAILED').not.toBeIstimaError();
      expect({code: 'AUDIO_LOAD_FAILED'}).not.toBeIstimaError();
      expect(undefined).not.toBeIstimaError();
      expect(null).not.toBeIstimaError();
    });
  });

  describe('with a code argument', () => {
    it('passes when the code matches', () => {
      const err = new IstimaAudioError('AUDIO_LOAD_FAILED', 'x', {
        recoverable: true,
      });
      expect(err).toBeIstimaError('AUDIO_LOAD_FAILED');
    });

    it('fails when the code does not match', () => {
      const err = new IstimaAudioError('AUDIO_LOAD_FAILED', 'x', {
        recoverable: true,
      });
      expect(err).not.toBeIstimaError('AUDIO_SEEK_FAILED');
    });

    it('fails when the value is not a IstimaError, regardless of code', () => {
      expect(new Error('boom')).not.toBeIstimaError('AUDIO_LOAD_FAILED');
    });
  });

  it('produces a useful failure message when the assertion fails', () => {
    const plain = new Error('boom');
    expect(() => expect(plain).toBeIstimaError()).toThrow(/IstimaError/);
  });

  it('produces a useful failure message when the code mismatches', () => {
    const err = new IstimaAudioError('AUDIO_LOAD_FAILED', 'x', {
      recoverable: true,
    });
    expect(() => expect(err).toBeIstimaError('AUDIO_SEEK_FAILED')).toThrow(
      /AUDIO_SEEK_FAILED/,
    );
  });
});
