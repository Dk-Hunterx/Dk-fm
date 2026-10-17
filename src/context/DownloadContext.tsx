import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DownloadedEpisode, Episode, Story } from '../types';
import { 
  getAllOfflineEpisodes, 
  saveOfflineEpisode, 
  deleteOfflineEpisode, 
  clearAllOfflineEpisodes, 
  downloadAudioBlob 
} from '../utils/indexedDB';

interface DownloadContextType {
  downloads: DownloadedEpisode[];
  downloadingIds: Record<string, number>; // episode_id -> progress percentage
  isDownloaded: (episodeId: string) => boolean;
  isDownloading: (episodeId: string) => boolean;
  getDownload: (episodeId: string) => DownloadedEpisode | undefined;
  downloadEpisode: (episode: Episode, story: Story) => Promise<void>;
  removeDownload: (episodeId: string) => Promise<void>;
  clearDownloads: () => Promise<void>;
  totalStorageBytes: number;
  refreshDownloads: () => Promise<void>;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloads, setDownloads] = useState<DownloadedEpisode[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, number>>({});

  const refreshDownloads = useCallback(async () => {
    try {
      const items = await getAllOfflineEpisodes();
      setDownloads(items);
    } catch (err) {
      console.warn('Failed to load downloads from IndexedDB:', err);
    }
  }, []);

  useEffect(() => {
    refreshDownloads();
  }, [refreshDownloads]);

  const isDownloaded = useCallback((episodeId: string): boolean => {
    return downloads.some((d) => d.episode_id === episodeId);
  }, [downloads]);

  const isDownloading = useCallback((episodeId: string): boolean => {
    return episodeId in downloadingIds;
  }, [downloadingIds]);

  const getDownload = useCallback((episodeId: string): DownloadedEpisode | undefined => {
    return downloads.find((d) => d.episode_id === episodeId);
  }, [downloads]);

  const downloadEpisode = async (episode: Episode, story: Story) => {
    if (isDownloaded(episode.id) || isDownloading(episode.id)) return;

    // Start progress simulation while fetching
    setDownloadingIds((prev) => ({ ...prev, [episode.id]: 15 }));

    try {
      // Progress tick
      const interval = setInterval(() => {
        setDownloadingIds((prev) => {
          const current = prev[episode.id];
          if (!current || current >= 85) return prev;
          return { ...prev, [episode.id]: current + 20 };
        });
      }, 250);

      const blob = await downloadAudioBlob(episode.audio_url, episode.duration);
      clearInterval(interval);

      setDownloadingIds((prev) => ({ ...prev, [episode.id]: 100 }));

      const downloadItem: DownloadedEpisode = {
        episode_id: episode.id,
        story_id: story.id,
        episode,
        story,
        audio_blob: blob,
        size_bytes: blob.size || (episode.duration * 16000), // ~128kbps approx
        downloaded_at: new Date().toISOString(),
      };

      await saveOfflineEpisode(downloadItem);
      await refreshDownloads();
    } catch (err) {
      console.error('Failed to download episode:', err);
    } finally {
      setTimeout(() => {
        setDownloadingIds((prev) => {
          const copy = { ...prev };
          delete copy[episode.id];
          return copy;
        });
      }, 400);
    }
  };

  const removeDownload = async (episodeId: string) => {
    try {
      await deleteOfflineEpisode(episodeId);
      await refreshDownloads();
    } catch (err) {
      console.error('Failed to delete offline episode:', err);
    }
  };

  const clearDownloads = async () => {
    try {
      await clearAllOfflineEpisodes();
      await refreshDownloads();
    } catch (err) {
      console.error('Failed to clear offline episodes:', err);
    }
  };

  const totalStorageBytes = downloads.reduce((acc, d) => acc + (d.size_bytes || 0), 0);

  return (
    <DownloadContext.Provider
      value={{
        downloads,
        downloadingIds,
        isDownloaded,
        isDownloading,
        getDownload,
        downloadEpisode,
        removeDownload,
        clearDownloads,
        totalStorageBytes,
        refreshDownloads,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) throw new Error('useDownload must be used within a DownloadProvider');
  return context;
};
