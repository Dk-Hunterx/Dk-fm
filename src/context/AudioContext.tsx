import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Story, Episode } from '../types';
import { useApp } from './AppContext';
import { getOfflineEpisode } from '../utils/indexedDB';

export type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;
export type SleepTimerOption = 0 | 5 | 15 | 30 | 45 | 60 | -1; // -1 = end of episode

interface AudioContextType {
  currentStory: Story | null;
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: PlaybackRate;
  volume: number;
  isMuted: boolean;
  isExpanded: boolean;
  isLoading: boolean;
  error: string | null;
  sleepTimer: SleepTimerOption;
  sleepRemainingSeconds: number | null;
  isSpeechMode: boolean;

  // Actions
  playEpisode: (story: Story, episode: Episode, startPosition?: number) => void;
  togglePlay: () => void;
  seek: (positionSeconds: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setRate: (rate: PlaybackRate) => void;
  setVol: (volume: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setExpanded: (expanded: boolean) => void;
  setSleep: (option: SleepTimerOption) => void;
  toggleSpeechMode: () => void;
  hasNextEpisode: boolean;
  hasPreviousEpisode: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { episodes, saveProgress, getProgress, incrementEpisodePlays, incrementStoryViews } = useApp();

  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sleepTimer, setSleepTimer] = useState<SleepTimerOption>(0);
  const [sleepRemainingSeconds, setSleepRemainingSeconds] = useState<number | null>(null);
  const [isSpeechMode, setIsSpeechMode] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSavedPositionRef = useRef<number>(0);

  // Initialize Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Auto save progress every 5 seconds
      if (Math.abs(audio.currentTime - lastSavedPositionRef.current) >= 5) {
        lastSavedPositionRef.current = audio.currentTime;
        if (currentStory && currentEpisode) {
          saveProgress(currentStory.id, currentEpisode.id, audio.currentTime, audio.duration || currentEpisode.duration);
        }
      }
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    const handleEnded = () => {
      setIsPlaying(false);
      if (currentStory && currentEpisode) {
        saveProgress(currentStory.id, currentEpisode.id, audio.duration || currentEpisode.duration, audio.duration || currentEpisode.duration, true);
      }
      // If sleep timer was end of episode, reset sleep timer
      if (sleepTimer === -1) {
        setSleepTimer(0);
        setSleepRemainingSeconds(null);
        return;
      }
      // Auto-play next episode
      playNext();
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('Unable to stream remote audio source. You can switch to AI Narrator mode for instant voice playback!');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStory, currentEpisode, sleepTimer, saveProgress]);

  // Handle sleep timer countdown
  useEffect(() => {
    if (sleepTimer <= 0) {
      setSleepRemainingSeconds(null);
      return;
    }

    setSleepRemainingSeconds(sleepTimer * 60);

    const interval = setInterval(() => {
      setSleepRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (audioRef.current) audioRef.current.pause();
          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
          setIsPlaying(false);
          setSleepTimer(0);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimer]);

  // Story episodes list
  const storyEpisodes = currentStory
    ? episodes.filter((e) => e.story_id === currentStory.id && e.status === 'published').sort((a, b) => a.episode_number - b.episode_number)
    : [];

  const currentEpisodeIndex = storyEpisodes.findIndex((e) => e.id === currentEpisode?.id);
  const hasNextEpisode = currentEpisodeIndex >= 0 && currentEpisodeIndex < storyEpisodes.length - 1;
  const hasPreviousEpisode = currentEpisodeIndex > 0;

  // Web Speech API Narrator fallback
  const startSpeechNarration = useCallback((text: string, rate: number) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      if (sleepTimer === -1) {
        setSleepTimer(0);
        return;
      }
      playNext();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setError('Voice synthesis encountered an issue.');
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [sleepTimer]);

  const playEpisode = useCallback(
    (story: Story, episode: Episode, startPosition?: number) => {
      setCurrentStory(story);
      setCurrentEpisode(episode);
      setError(null);
      setIsLoading(true);

      // Check for saved progress if startPosition is not passed
      let resumeTime = startPosition ?? 0;
      if (startPosition === undefined) {
        const saved = getProgress(episode.id);
        if (saved && !saved.completed && saved.current_position > 5) {
          resumeTime = saved.current_position;
        }
      }

      setDuration(episode.duration);
      setCurrentTime(resumeTime);
      lastSavedPositionRef.current = resumeTime;

      // Stats increment
      incrementEpisodePlays(episode.id);
      incrementStoryViews(story.id);

      if (isSpeechMode && episode.narration_text) {
        setIsLoading(false);
        startSpeechNarration(episode.narration_text, playbackRate);
        return;
      }

      const audio = audioRef.current;
      if (audio) {
        // Check if offline episode exists in IndexedDB
        getOfflineEpisode(episode.id)
          .then((offlineItem) => {
            if (offlineItem && offlineItem.audio_blob) {
              audio.src = URL.createObjectURL(offlineItem.audio_blob);
            } else {
              audio.src = episode.audio_url;
            }
            audio.playbackRate = playbackRate;
            audio.volume = isMuted ? 0 : volume;
            audio.load();
          })
          .catch(() => {
            audio.src = episode.audio_url;
            audio.playbackRate = playbackRate;
            audio.volume = isMuted ? 0 : volume;
            audio.load();
          });

        audio.oncanplay = () => {
          if (resumeTime > 0 && Math.abs(audio.currentTime - resumeTime) > 1) {
            audio.currentTime = resumeTime;
          }
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch((err) => {
              console.warn('Playback autoplay policy or network error:', err);
              setIsLoading(false);
              // Fallback to speech narration if audio fails to play
              if (episode.narration_text) {
                setIsSpeechMode(true);
                startSpeechNarration(episode.narration_text, playbackRate);
              } else {
                setError('Audio blocked or unavailable. Click play to resume.');
              }
            });
        };
      }
    },
    [getProgress, incrementEpisodePlays, incrementStoryViews, isMuted, isSpeechMode, playbackRate, startSpeechNarration, volume]
  );

  const togglePlay = () => {
    if (!currentEpisode || !currentStory) return;

    if (isSpeechMode) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        } else if (currentEpisode.narration_text) {
          startSpeechNarration(currentEpisode.narration_text, playbackRate);
        }
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      saveProgress(currentStory.id, currentEpisode.id, audio.currentTime, audio.duration || currentEpisode.duration);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setError(null);
        })
        .catch(() => {
          // Fallback to speech mode
          if (currentEpisode.narration_text) {
            setIsSpeechMode(true);
            startSpeechNarration(currentEpisode.narration_text, playbackRate);
          } else {
            setError('Playback interrupted. Please try again.');
          }
        });
    }
  };

  const seek = (seconds: number) => {
    const target = Math.max(0, Math.min(seconds, duration || 3600));
    setCurrentTime(target);
    lastSavedPositionRef.current = target;
    if (audioRef.current && !isSpeechMode) {
      audioRef.current.currentTime = target;
    }
    if (currentStory && currentEpisode) {
      saveProgress(currentStory.id, currentEpisode.id, target, duration || currentEpisode.duration);
    }
  };

  const skipForward = (seconds = 15) => {
    seek(currentTime + seconds);
  };

  const skipBackward = (seconds = 15) => {
    seek(currentTime - seconds);
  };

  const setRate = (rate: PlaybackRate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    if (isSpeechMode && isPlaying && currentEpisode?.narration_text) {
      startSpeechNarration(currentEpisode.narration_text, rate);
    }
  };

  const setVol = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    setIsMuted(clamped === 0);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume > 0 ? volume : 0.85;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const playNext = () => {
    if (hasNextEpisode && currentStory) {
      const nextEp = storyEpisodes[currentEpisodeIndex + 1];
      playEpisode(currentStory, nextEp, 0);
    }
  };

  const playPrevious = () => {
    if (hasPreviousEpisode && currentStory) {
      const prevEp = storyEpisodes[currentEpisodeIndex - 1];
      playEpisode(currentStory, prevEp, 0);
    }
  };

  const toggleSpeechMode = () => {
    const nextMode = !isSpeechMode;
    setIsSpeechMode(nextMode);
    if (audioRef.current) audioRef.current.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlaying(false);

    if (nextMode && currentEpisode?.narration_text) {
      startSpeechNarration(currentEpisode.narration_text, playbackRate);
    } else if (!nextMode && currentStory && currentEpisode) {
      playEpisode(currentStory, currentEpisode, currentTime);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentStory,
        currentEpisode,
        isPlaying,
        currentTime,
        duration,
        playbackRate,
        volume,
        isMuted,
        isExpanded,
        isLoading,
        error,
        sleepTimer,
        sleepRemainingSeconds,
        isSpeechMode,
        playEpisode,
        togglePlay,
        seek,
        skipForward,
        skipBackward,
        setRate,
        setVol,
        toggleMute,
        playNext,
        playPrevious,
        setExpanded: setIsExpanded,
        setSleep: setSleepTimer,
        toggleSpeechMode,
        hasNextEpisode,
        hasPreviousEpisode,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};
