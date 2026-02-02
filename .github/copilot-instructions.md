# Copilot Instructions - RemakeSoF Game Launcher

## Project Overview

A cross-platform game launcher for RemakeSoF (Soldier of Fortune 2 Remake) built with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **Backend**: Rust + Tauri (desktop shell)
- **External API**: FastAPI server at `http://localhost:8000` (not included in this repo)
- **Architecture**: Service-oriented with clear separation between UI, business logic, and IPC layer

**Key Architectural Principle**: Frontend services call Tauri commands (IPC), which delegate to Rust services that handle HTTP communication with external FastAPI backend.

## Critical Developer Workflows

### Development Commands
```bash
# Start Tauri in dev mode (launches both Vite dev server and Rust app)
npm run tauri:dev

# Frontend only (for UI work without Tauri)
npm run dev

# Build for production
npm run tauri:build
```

**Important**: The external FastAPI backend must be running at `http://localhost:8000` for authentication and game management features to work. The Tauri app communicates with this external service.

### Project-Specific Conventions

#### State Management Pattern
- **Zustand** is the single source of truth: [src/services/store.ts](src/services/store.ts)
- Store contains both state AND actions (no separate action files)
- Services are called from store actions, not directly from components
- Components use `useLauncherStore()` hook to access state/actions

**Example Pattern**:
```typescript
// ✅ Correct: Component calls store action
const { login } = useLauncherStore();
await login(username, password);

// ❌ Wrong: Component calls service directly
await AuthService.login(username, password);
```

#### IPC Communication Flow
**Frontend → Tauri → External API**:
1. Frontend service (e.g., [authService.ts](src/services/authService.ts)) currently calls FastAPI directly via `fetch()`
2. Tauri commands (e.g., [auth.rs](src-tauri/src/commands/auth.rs)) are thin wrappers around Rust services
3. Rust services (e.g., [auth_service.rs](src-tauri/src/services/auth_service.rs)) make HTTP requests to FastAPI backend

**Note**: There's architectural inconsistency - frontend services bypass Tauri for HTTP calls. For new features, use Tauri commands (`invoke('command_name')`) rather than direct `fetch()` calls to maintain proper IPC boundaries.

#### Tauri Commands Registration
All commands MUST be registered in [src-tauri/src/main.rs](src-tauri/src/main.rs):
```rust
.invoke_handler(tauri::generate_handler![
    auth::login,
    auth::logout,
    game::check_version,
    // Add new commands here
])
```

#### Event-Driven Progress Updates
For long-running operations (downloads), Rust emits events to frontend:
```rust
// Rust side (in command)
let _ = window.emit("download-progress", progress);

// Frontend listens via Tauri API
import { listen } from '@tauri-apps/api/event';
listen('download-progress', (event) => { /* handle */ });
```

### Type Definitions

**Shared Types**: Types are duplicated across TypeScript ([src/types/index.ts](src/types/index.ts)) and Rust ([src-tauri/src/types.rs](src-tauri/src/types.rs)). When adding new types:
1. Define in TypeScript first
2. Mirror in Rust with `#[derive(Serialize, Deserialize)]`
3. Ensure field names match exactly (camelCase in TS → snake_case in Rust via serde)

**LauncherStatus Enum**: Used as state machine for UI rendering:
```typescript
IDLE → CHECKING_VERSION → DOWNLOADING → INSTALLING → READY → PLAYING
                                ↓
                              ERROR
```

### Error Handling Patterns

#### TypeScript
- Services throw errors, store catches them and sets `errorMessage` state
- Never silent catch - always update UI state or log
- Format: `throw new Error(\`Descriptive message: ${error}\`)`

#### Rust
- Commands return `Result<T, String>` (String errors for frontend)
- Services use `Box<dyn Error>` for internal error propagation
- Map all errors to user-friendly strings before returning to frontend:
```rust
#[tauri::command]
pub async fn my_command() -> Result<Data, String> {
    match MyService::do_work().await {
        Ok(data) => Ok(data),
        Err(e) => Err(format!("User-friendly message: {}", e)),
    }
}
```

### File System Conventions

#### Install Path Resolution
- Default: `%LOCALAPPDATA%\RemakeSoF\Game` (Windows)
- Get via: `GameService::get_install_path()` (Rust) or [settingsService.ts](src/services/settingsService.ts)
- Token storage: `%LOCALAPPDATA%\RemakeSoF\.token` (insecure - TODO: use OS keychain)

#### Tauri Permissions
[tauri.conf.json](src-tauri/tauri.conf.json) defines security allowlist:
- HTTP: `http://localhost:8000/**` (FastAPI backend)
- FS: `$APPDATA/*` scope only
- Shell: `open` command only

**Adding New Permissions**: Update `allowlist` section in tauri.conf.json before using new APIs.

### Testing & Debugging

**No Tests Yet**: Project lacks test coverage. When adding tests:
- Frontend: Vitest + React Testing Library
- Rust: `#[cfg(test)]` modules + `cargo test`

**Debugging Tauri**:
- Rust logs: `println!()` appears in terminal running `npm run tauri:dev`
- Frontend logs: Open DevTools in Tauri window (right-click → Inspect)
- Network: Check Rust HTTP calls, not browser DevTools

### Common Gotchas

1. **Hardcoded API URL**: `http://localhost:8000` is hardcoded in multiple places. For production, extract to environment config.
2. **Incomplete Features**: `downloadGame()` lacks real progress tracking (marked with TODO comments)
3. **Token Storage**: Currently plaintext file. Production needs OS keychain integration (keyring crate).
4. **No Auto-Update**: Launcher doesn't self-update yet.
5. **Mixed HTTP Approaches**: Frontend sometimes uses `fetch()` directly, sometimes Tauri commands. Prefer Tauri commands for consistency.


## Code Quality Principles

### Function Design
- **Keep functions small**: Maximum 20 lines, one responsibility
- **Pure when possible**: Return values, don't mutate state
- **Explicit side effects**: Name functions clearly (`saveSettings`, `fetchData`)
- **DRY**: Extract repeated patterns into utilities

### Naming & Clarity
- **Descriptive names**: `currentUser` not `usr`, `isLoading` not `loading`
- **Boolean questions**: `isAuthenticated`, `hasError`, `canDownload`
- **Verb functions**: `fetchGames()`, `validateInput()`, `calculateProgress()`

### Architecture Patterns
- **Single Responsibility**: One service per domain ([authService.ts](src/services/authService.ts), [gameService.ts](src/services/gameService.ts))
- **Components**: UI rendering only, delegate to store actions
- **Services**: Business logic and external communication
- **Commands**: Thin Tauri wrappers with no business logic

**Example**:
```typescript
// ✅ Component delegates to store
const { login } = useLauncherStore();
await login(username, password);

// ❌ Don't call services directly
await AuthService.login(username, password);
```

### Type Safety
- **TypeScript**: No `any`, use discriminated unions for state machines
- **Rust**: `Result<T, E>` for errors, newtypes for domain concepts
- **Shared types**: Keep [types/index.ts](src/types/index.ts) and [types.rs](src-tauri/src/types.rs) in sync

### Error Handling
- **TypeScript**: Throw descriptive errors, catch in store, update `errorMessage` state
- **Rust**: Return `Result<T, String>` from commands, use `Box<dyn Error>` in services
- **Never**: Silent catches or generic error messages

## Naming & Organization

### TypeScript Conventions
- **Files**: `camelCase.ts`, `PascalCase.tsx` (components)
- **Components/Types**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

### Rust Conventions
- **Files/Modules**: `snake_case.rs`
- **Structs/Enums/Traits**: `PascalCase`
- **Functions/Variables**: `snake_case`
- **Constants**: `SCREAMING_SNAKE_CASE`

### Project Structure
```
src/
├── components/      # UI components ([Feature]Screen.tsx)
├── services/        # Business logic + store.ts
├── types/           # Shared TypeScript types
└── styles/          # CSS/Tailwind

src-tauri/src/
├── commands/        # Tauri IPC (thin wrappers)
├── services/        # Rust business logic
└── types.rs         # Shared Rust types
```

## Quick Checks

Before committing code:
- [ ] Functions < 20 lines, single responsibility
- [ ] No `any` in TypeScript, proper error handling
- [ ] Descriptive names, no abbreviations
- [ ] Components delegate to store, not services directly
- [ ] New Tauri commands registered in `main.rs`
- [ ] Types synced between TS and Rust
- [ ] Errors user-friendly, never silent catches

## Anti-Patterns
- ❌ Business logic in React components
- ❌ Direct `fetch()` calls (use Tauri commands for new features)
- ❌ `unwrap()` in Rust production code
- ❌ Mutating state directly in Zustand
- ❌ Generic error messages

## Development Tips
- **KISS**: Simple solutions over clever ones
- **YAGNI**: Don't build speculative features
- **Follow patterns**: Check existing code for conventions
- **Debug**: Rust logs in terminal, frontend in DevTools
- **API dependency**: External FastAPI at `localhost:8000` required
