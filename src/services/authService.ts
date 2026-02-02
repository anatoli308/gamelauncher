import { AuthResponse } from '../types';

const API_URL = 'http://localhost:8000';

export class AuthService {
  static async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/loginUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email: username, password }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Login failed: ${error}`);
    }
  }

  static async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/logoutUser`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      throw new Error(`Logout failed: ${error}`);
    }
  }

  static async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/refreshUser`, {
        method: 'POST',
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
      throw new Error(`Token refresh failed: ${error}`);
    }
  }
}
