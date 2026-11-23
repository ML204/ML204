'use client';

import { storage } from './storage';
import { Network } from '@capacitor/network';

export interface ContentPackMetadata {
  id: string;
  topicSlug: string;
  title: string;
  version: string;
  sizeBytes: number;
  downloadUrl: string;
  publishedAt: string;
}

export interface ContentPackManifest {
  manifestVersion: number;
  updatedAt: string;
  packs: ContentPackMetadata[];
}

export interface StoredTopicPack {
  topicSlug: string;
  version: string;
  content: string; // Serialized MDX or JSON topic structure
  downloadedAt: number;
}

const INSTALLED_PACKS_KEY = 'ml204:installed_packs';
const MANIFEST_CACHE_KEY = 'ml204:content_manifest_cache';

export const contentPackService = {
  /**
   * Check remote server for available topic content packs.
   */
  async checkAvailablePacks(manifestUrl: string): Promise<ContentPackMetadata[]> {
    try {
      const status = await Network.getStatus().catch(() => ({ connected: navigator.onLine }));
      if (!status.connected) {
        // Return cached manifest if offline
        const cached = await storage.getJSON<ContentPackManifest | null>(MANIFEST_CACHE_KEY, null);
        return cached ? cached.packs : [];
      }

      const res = await fetch(manifestUrl, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const manifest = (await res.json()) as ContentPackManifest;

      // Cache manifest for offline inspection
      await storage.setJSON(MANIFEST_CACHE_KEY, manifest);
      return manifest.packs;
    } catch (err) {
      console.warn('[ContentPacks] Failed to fetch manifest:', err);
      const cached = await storage.getJSON<ContentPackManifest | null>(MANIFEST_CACHE_KEY, null);
      return cached ? cached.packs : [];
    }
  },

  /**
   * Download and store a topic pack locally.
   */
  async downloadPack(pack: ContentPackMetadata): Promise<boolean> {
    try {
      const res = await fetch(pack.downloadUrl);
      if (!res.ok) throw new Error(`Download failed with status ${res.status}`);

      const packData = await res.text();
      const stored: StoredTopicPack = {
        topicSlug: pack.topicSlug,
        version: pack.version,
        content: packData,
        downloadedAt: Date.now(),
      };

      // Save topic data
      await storage.set(`ml204:pack:${pack.topicSlug}`, JSON.stringify(stored));

      // Record installed pack list
      const installed = await storage.getJSON<string[]>(INSTALLED_PACKS_KEY, []);
      if (!installed.includes(pack.topicSlug)) {
        installed.push(pack.topicSlug);
        await storage.setJSON(INSTALLED_PACKS_KEY, installed);
      }

      return true;
    } catch (err) {
      console.error(`[ContentPacks] Error downloading pack ${pack.topicSlug}:`, err);
      return false;
    }
  },

  /**
   * Retrieve a locally downloaded topic pack.
   */
  async getInstalledPack(topicSlug: string): Promise<StoredTopicPack | null> {
    const pack = await storage.getJSON<StoredTopicPack | null>(`ml204:pack:${topicSlug}`, null);
    if (pack) return pack;
    return storage.getJSON<StoredTopicPack | null>(`mlens:pack:${topicSlug}`, null);
  },

  /**
   * List all locally installed dynamic topic slugs.
   */
  async getInstalledSlugs(): Promise<string[]> {
    return storage.getJSON<string[]>(INSTALLED_PACKS_KEY, []);
  },
};
