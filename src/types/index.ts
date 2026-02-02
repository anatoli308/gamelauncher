export interface AuthResponse {
  message: string;
  playerId: string;
  username: string;
  token: string;
  selectedSkinName?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface GameVersion {
  version: string;
  releaseDate: string;
  downloadUrl: string;
  fileSize: number;
  checksum: string;
}

export interface DownloadProgress {
  downloadedBytes: number;
  totalBytes: number;
  progressPercent: number;
  speedMbps: number;
}

export interface LauncherSettings {
  serverUrl: string;
  installPath: string;
  autoUpdate: boolean;
  rememberMe: boolean;
  language: string;
}

export enum LauncherStatus {
  IDLE = 'idle',
  CHECKING_VERSION = 'checking_version',
  DOWNLOADING = 'downloading',
  INSTALLING = 'installing',
  READY = 'ready',
  UPDATING = 'updating',
  PLAYING = 'playing',
  ERROR = 'error',
}
