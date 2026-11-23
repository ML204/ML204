'use client';

import { Network } from '@capacitor/network';
import { storage } from './storage';

export interface QueuedFeedback {
  id: string;
  type: 'like' | 'rating' | 'suggestion';
  subchapterSlug: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

const QUEUE_KEY = 'ml204:offline_feedback_queue';

class OfflineQueueManager {
  private isOnline = true;
  private isProcessing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initNetworkListener();
    }
  }

  private async initNetworkListener() {
    try {
      const status = await Network.getStatus();
      this.isOnline = status.connected;

      Network.addListener('networkStatusChange', (status) => {
        const wasOffline = !this.isOnline;
        this.isOnline = status.connected;
        if (wasOffline && this.isOnline) {
          console.log('[OfflineQueue] Device came online. Flushing queue...');
          this.flush();
        }
      });
    } catch {
      // Browser fallback
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flush();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  async enqueue(
    type: 'like' | 'rating' | 'suggestion',
    subchapterSlug: string,
    payload: Record<string, unknown>
  ): Promise<boolean> {
    const item: QueuedFeedback = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      subchapterSlug,
      payload,
      timestamp: Date.now(),
    };

    const queue = await storage.getJSON<QueuedFeedback[]>(QUEUE_KEY, []);
    queue.push(item);
    await storage.setJSON(QUEUE_KEY, queue);

    // If online, immediately try to sync
    if (this.isOnline) {
      this.flush();
    }

    return true;
  }

  async flush(): Promise<number> {
    if (this.isProcessing) return 0;
    this.isProcessing = true;

    try {
      const queue = await storage.getJSON<QueuedFeedback[]>(QUEUE_KEY, []);
      if (queue.length === 0) {
        this.isProcessing = false;
        return 0;
      }

      console.log(`[OfflineQueue] Attempting to sync ${queue.length} items.`);
      const remaining: QueuedFeedback[] = [];
      let syncedCount = 0;

      for (const item of queue) {
        try {
          // If you have a backend feedback endpoint, configure it here:
          // await fetch('https://your-api.com/feedback', { method: 'POST', body: JSON.stringify(item) });
          syncedCount++;
        } catch {
          remaining.push(item);
        }
      }

      await storage.setJSON(QUEUE_KEY, remaining);
      return syncedCount;
    } finally {
      this.isProcessing = false;
    }
  }

  async getQueueLength(): Promise<number> {
    const queue = await storage.getJSON<QueuedFeedback[]>(QUEUE_KEY, []);
    return queue.length;
  }
}

export const offlineQueue = new OfflineQueueManager();
