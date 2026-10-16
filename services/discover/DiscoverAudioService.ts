/**
 * Audio for the Discover feed. Uses its own short-lived player, never the main player or its
 * queue. It plays one ayah (a start and end time inside the normal recitation file) on loop and
 * steps aside when the main player starts.
 */
import {createAudioPlayer, type AudioPlayer} from 'expo-audio';
import {usePlayerStore} from '@/services/player/store/playerStore';
import {audioCoordinator} from '@/services/audio/AudioCoordinator';

class DiscoverAudioService {
  private player: AudioPlayer | null = null;
  private sub: {remove: () => void} | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private token = 0;

  async playClip(url: string, startMs: number, endMs: number): Promise<void> {
    const token = ++this.token;
    this.release();
    try {
      // Make room: pause the main player if it is playing.
      audioCoordinator.mushafWillPlay();
      const player = createAudioPlayer({uri: url});
      this.player = player;
      const startSec = startMs / 1000;
      const endSec = endMs / 1000;
      let seeked = false;
      this.sub = player.addListener('playbackStatusUpdate', status => {
        if (token !== this.token) return;
        if (status.isLoaded && !seeked) {
          seeked = true;
          player.seekTo(startSec).catch(() => {});
        }
        if (seeked && (status.currentTime >= endSec || status.didJustFinish)) {
          player.seekTo(startSec).catch(() => {});
          if (status.didJustFinish) player.play();
        }
      });
      // If the user starts the main player, stop the feed.
      this.unsubscribeStore = usePlayerStore.subscribe(state => {
        if (state.playback.state === 'playing') this.pause();
      });
      player.play();
    } catch {
      this.release();
    }
  }

  pause(): void {
    try {
      this.player?.pause();
    } catch {
      /* released */
    }
  }

  resume(): void {
    try {
      audioCoordinator.mushafWillPlay();
      this.player?.play();
    } catch {
      /* released */
    }
  }

  isPlaying(): boolean {
    return Boolean(this.player?.playing);
  }

  release(): void {
    try {
      this.sub?.remove();
      this.unsubscribeStore?.();
      this.player?.pause();
      this.player?.remove();
    } catch {
      /* already released */
    }
    this.sub = null;
    this.unsubscribeStore = null;
    this.player = null;
    audioCoordinator.sourceDidStop('mushaf');
  }

  stop(): void {
    this.token += 1;
    this.release();
  }
}

export const discoverAudioService = new DiscoverAudioService();
