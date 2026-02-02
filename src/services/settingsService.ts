import { LauncherSettings } from '../types';

const API_URL = 'http://localhost:8000';

export class SettingsService {
  static async getSettings(): Promise<LauncherSettings> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      // Return defaults if loading fails
      return {
        serverUrl: 'http://localhost:8000',
        installPath: '',
        autoUpdate: true,
        rememberMe: false,
        language: 'en',
      };
    }
  }

  static async saveSettings(settings: LauncherSettings): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Failed to save settings: ${error}`);
    }
  }
}
