'use client';

import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

/**
 * Unified storage engine supporting Capacitor Preferences on Android/iOS
 * and falling back gracefully to localStorage when in a web browser.
 */
export const storage = {
  async get(key: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },

  async set(key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key, value });
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },

  async remove(key: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key });
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },

  async clear(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.clear();
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  },

  async getJSON<T>(key: string, defaultValue: T): Promise<T> {
    const raw = await this.get(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    await this.set(key, JSON.stringify(value));
  },
};
