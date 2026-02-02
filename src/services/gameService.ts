import { GameVersion, DownloadProgress } from '../types';

const API_URL = 'http://localhost:8000';

export class GameService {
  static async checkVersion(): Promise<GameVersion> {
    try {
      const response = await fetch(`${API_URL}/api/game/version`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to check version: ${error}`);
    }
  }

  static async downloadGame(
    version: string,
    installPath: string,
    onProgress: (progress: DownloadProgress) => void
  ): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/game/download`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version, installPath }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // TODO: Implement WebSocket or Server-Sent Events for progress tracking
      // For now, just resolve when download is complete
      await response.json();
    } catch (error) {
      throw new Error(`Failed to download game: ${error}`);
    }
  }

  static async launchGame(token: string, installPath: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/game/launch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ installPath }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Failed to launch game: ${error}`);
    }
  }

  static async getInstallPath(): Promise<string> {
    // Return default local path - no backend call needed
    const defaultPath = 'C:\\RemakeSoF\\Game';
    return defaultPath;
  }
}
