# RemakeSoF Game Launcher

Ein moderner, cross-platform Game Launcher für RemakeSoF (Soldier of Fortune 2 Remake), gebaut mit **Tauri**, **React**, **TypeScript** und **Rust**.

## 🎮 Features

### ✅ Implementiert
- **Authentifizierung**: JWT-basierter Login mit externer FastAPI
- **Version Management**: Automatische Version-Checks vom Server
- **Game Launch**: Starten des Spiels mit Token-Integration
- **Modernes UI**: Responsive Design mit TailwindCSS
- **Desktop App**: Native Performance durch Tauri/Rust

### 🚧 In Entwicklung
- **Download Manager**: Progress Tracking und Resume-Funktionalität
- **Auto-Update**: Automatische Launcher-Updates
- **Sichere Token-Speicherung**: OS Keychain Integration
- **Settings Management**: Persistente Einstellungen

---

## 📦 Technologie-Stack

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server
- **TailwindCSS** - Styling
- **Zustand** - State Management

### Desktop Backend (Tauri)
- **Rust** - Native Backend
- **Tauri 1.x** - Desktop Framework
- **reqwest** - HTTP Client für API-Calls

### Externe API (nicht in diesem Repo)
- **FastAPI** - Python Backend auf `http://localhost:8000`
- **JWT** - Token-basierte Authentifizierung

---

## 🚀 Quick Start

### 1. Prerequisites

Installiere folgende Tools:

- **Node.js 18+** - https://nodejs.org/
- **Python 3.11+** (optional) - Für das externe Backend: https://www.python.org/

### 2. Installation

```bash
# Navigate to launcher directory
cd gamelauncher

# Install frontend dependencies
npm install
# Start Launcher (Dev Server)
npm run tauri:dev
# Build optimized launcher
npm run tauri:build

# Output: src-tauri/target/release/remakesof-launcher.exe
```

---

## 📁 Projekt-Struktur

```
gamelauncher/
├── src/build

# Output: dist/
│   │   └── LauncherScreen.tsx    # Main Launcher UI
│   ├── services/                 # Business Logic
│   │   ├── authService.ts        # Auth API Calls
│   │   ├── gameService.ts        # Game API Calls
│   │   ├── settingsService.ts    # Settings Management
│   │   └── store.ts              # Zustand State Store
│   ├── types/                    # TypeScript Types
│   │   └── index.ts
│   ├── styles/                   # CSS/Styles
│   │   └── index.css
│   ├── App.tsx                   # Main App Component
│   └── main.tsx                  # Entry Point
├── src-tauri/                    # Tauri Backend (Rust)
│   ├── src/
│   │   ├── commands/             # Tauri Commands
│   │   │   ├── auth.rs           # Auth Commands
│   │   │   ├── game.rs           # Game Commands
│   │   │   └── settings.rs       # Settings Commands
│   │   ├── services/             # Business Logic - DEPRECATED
│   └── [Wird nicht mehr benötigt]
├── package.json                  # Node Dependencies
├── vite.config.ts                # Vite Configuration
├── tailwind.config.js            # TailwindCSS Config
├── tsconfig.json                 # TypeScript Config
└── README.md                     # This file
```

**Backend-API:** Läuft extern auf `http://localhost:8000` (oder deinem Remote-Server)
1. User enters credentials → LoginScreen
2. Frontend calls → authService.login()
3. Tauri Command → auth::login
4. Rust Service → AuthService::login()
5. HTTP Request → FastAPI /api/loginUser
6. FastAPI validates → Returns JWT Token
7. Token stored → Local Storage / Keychain
8. User authenticated → LauncherScreen
```

---

## 📥 Download Flow

```
1. User clicks "Download" → LauncherScreen
2. Frontend calls → gameService.downloadGame()
3. Tauri Command → game::download_game
4. Rust Service → GameService::download_game()
5. HTTP Stream → FastAPI /api/game/download
6. Progress Events → Frontend (via Tauri Events)
7. File saved → Local Install Directory
8. Integrity Check → SHA256 Verification
9. Status updated → "Ready to Play"
```
HTTP Request → FastAPI /auth/login (http://localhost:8000)
4. FastAPI validates → Returns JWT Token
5. Token stored → Local Storage
6``
1. User clicks "PLAY" → LauncherScreen
2. Frontend calls → gameService.launchGame()
3. Tauri Command → game::launch_game
4. Rust spawns → RemakeSoF.exe --token <JWT>
5. Game reads token → Authenticates with server
6. HTTP Request → FastAPI /game/download (http://localhost:8000)
4. File streamed → Downloaded to Install Directory
5
### Backend API URL

Ändere in `src-tauri/src/services/auth_service.rs` und `game_service.rs`:

```rust
const API_URL: &'static str = "http://localhost:8000/api";
// Change to your production URL:
// const API_URL: &'static str = "https://api.remakesof.com/api";
```

### Install Path

Standard-Installationspfad:
- WHTTP Request → FastAPI /game/launch (http://localhost:8000)
4. Game starts with token authorization
5. Launcher status updated
---

## 🧪 Testing

### Test Accounts (FastAPI Backend)

```
Username: admin
Password: admin123
/services/authService.ts`, `gameService.ts` und `settingsService.ts`:

```typescript
const API_URL = 'http://localhost:8000';
// Change to your production URL:
// const API_URL = 'https://api.remakesof.com';
``
---

## 🔧 Troubleshooting

### Problem: Tauri Build fails

**Solution:**
```bash
# Ensure Rust is installed
rustc --version

# Update Rust
rustup update

# Clean build
cd src-tauri
cargo clean
cd ..
npm run tauri:build
```

### Problem: Frontend not connecting to Backend

**Solution:**
- Verifye die externe FastAPI Backend (http://localhost:8000)
2. Starte den Launcher Development Mode (`npm run dev`)
3. Melde dich mit einem Test-Account an
4. Überprüfe die Version-Abfrage
5. Teste Download-Funktionalität
6. Verifiziere Error H
**Solution:**
- Check `backend-api/game_versions` directory exists
- Verify file permissions
- Check FastAPI logs for errors

---Frontend not connecting to Backend

**Solution:**
- Stelle sicher, dass die FastAPI auf Port 8000 läuft
- Überprüfe CORS-Konfiguration in deinem Backend
- Verifiziere `API_URL` in `src/services/*.ts`
- Prüfe Browser-Konsole auf Fehler

### Problem: Download not working

**Solution:**
- Stelle sicher, dass die Backend-API läuft
- Überprüfe die Authentifizierung (Token)
- Prüfe Backend-Logs auf FehleruthenticateWithToken(token);

string GetTokenFromCommandLineArgs()
{
    string[] args = System.Environment.GetCommandLineArgs();
    for (int i = 0; i < args.Length - 1; i++)
    {
        if (args[i] == "--token")
            return args[i + 1];
    }
    return null;
}
```

### 2. Token Validation im AuthenticationManager

```csharp
Der Launcher stellt das JWT-Token zur Verfügung, das dein Game mit der Backend-API authentifizieren kann.

Token abrufen:
```typescript
const token = localStorage.getItem('token');
// Use token in Authorization header: Bearer <token>