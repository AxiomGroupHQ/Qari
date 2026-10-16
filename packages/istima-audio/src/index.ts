// Ports (ADR-0001 - the seam @istima/audio exposes to consumers)
export type {
  IstimaAudioConfig,
  CoordinatorHooks,
  LockScreenMetadataSource,
  PlayerController,
  PlayerEventSink,
  TimestampProvider,
  Unsubscribe,
} from './ports';
export {NullPlayerEventSink} from './ports';

// Adapters (stub today - fully wired in RFC-005)
export {ExpoAudioPlayerControllerAdapter} from './adapters/expo-audio-player-controller';
