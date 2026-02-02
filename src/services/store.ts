import { create } from 'zustand';
import { AuthResponse, GameVersion, LauncherSettings, LauncherStatus, DownloadProgress } from '../types';
import { AuthService } from './authService';
import { GameService } from './gameService';
import { SettingsService } from './settingsService';

interface LauncherState {
  // Auth state
  isAuthenticated: boolean;
  user: AuthResponse | null;
  token: string | null;

  // Game state
  gameVersion: GameVersion | null;
  installedVersion: string | null;
  launcherStatus: LauncherStatus;
  downloadProgress: DownloadProgress | null;
  errorMessage: string | null;

  // Settings
  settings: LauncherSettings | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkGameVersion: () => Promise<void>;
  downloadGame: () => Promise<void>;
  launchGame: () => Promise<void>;
  updateSettings: (settings: LauncherSettings) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useLauncherStore = create<LauncherState>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  token: null,
  gameVersion: null,
  installedVersion: null,
  launcherStatus: LauncherStatus.IDLE,
  downloadProgress: null,
  errorMessage: null,
  settings: null,

  // Initialize launcher
  initialize: async () => {
    try {
      const settings = await SettingsService.getSettings();
      set({ settings });

      // Check for stored token
      // TODO: Implement auto-login with stored token
    } catch (error) {
      console.error('Failed to initialize launcher:', error);
    }
  },

  // Login
  login: async (username: string, password: string) => {
    try {
      set({ launcherStatus: LauncherStatus.IDLE, errorMessage: null });
      
      const response = await AuthService.login(username, password);
      
      set({
        isAuthenticated: true,
        user: response,
        token: response.token,
      });

      // After login, check game version
      await get().checkGameVersion();
    } catch (error: any) {
      set({
        errorMessage: error.toString(),
        launcherStatus: LauncherStatus.ERROR,
      });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await AuthService.logout();
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        launcherStatus: LauncherStatus.IDLE,
      });
    } catch (error: any) {
      console.error('Logout failed:', error);
    }
  },

  // Check game version
  checkGameVersion: async () => {
    try {
      set({ launcherStatus: LauncherStatus.CHECKING_VERSION });
      
      const version = await GameService.checkVersion();
      const installPath = await GameService.getInstallPath();
      
      set({
        gameVersion: version,
        launcherStatus: LauncherStatus.READY,
      });
    } catch (error: any) {
      set({
        errorMessage: 'Failed to check game version',
        launcherStatus: LauncherStatus.ERROR,
      });
    }
  },

  // Download game
  downloadGame: async () => {
    const { gameVersion, settings } = get();
    
    if (!gameVersion || !settings) {
      set({ errorMessage: 'Version or settings not available' });
      return;
    }

    try {
      set({ 
        launcherStatus: LauncherStatus.DOWNLOADING,
        downloadProgress: {
          downloadedBytes: 0,
          totalBytes: gameVersion.fileSize,
          progressPercent: 0,
          speedMbps: 0,
        },
      });

      await GameService.downloadGame(
        gameVersion.version,
        settings.installPath,
        (progress) => {
          set({ downloadProgress: progress });
        }
      );

      set({ 
        launcherStatus: LauncherStatus.READY,
        installedVersion: gameVersion.version,
      });
    } catch (error: any) {
      set({
        errorMessage: 'Download failed: ' + error.toString(),
        launcherStatus: LauncherStatus.ERROR,
      });
    }
  },

  // Launch game
  launchGame: async () => {
    const { token, settings } = get();
    
    if (!token || !settings) {
      set({ errorMessage: 'Not authenticated or settings missing' });
      return;
    }

    try {
      set({ launcherStatus: LauncherStatus.PLAYING });
      
      await GameService.launchGame(token, settings.installPath);
      
      // Game launched successfully
      set({ launcherStatus: LauncherStatus.READY });
    } catch (error: any) {
      set({
        errorMessage: 'Failed to launch game: ' + error.toString(),
        launcherStatus: LauncherStatus.ERROR,
      });
    }
  },

  // Update settings
  updateSettings: async (settings: LauncherSettings) => {
    try {
      await SettingsService.saveSettings(settings);
      set({ settings });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
    }
  },
}));
