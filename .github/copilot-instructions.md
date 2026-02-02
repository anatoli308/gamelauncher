# Copilot Instructions - Game Launcher

## Project Overview

This is a cross-platform game launcher built with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Rust + Tauri
- **Architecture**: Event-driven with IPC communication between frontend and backend

## SOLID Principles

### Single Responsibility Principle (SRP)
- Each service, component, and module must have **one** clear responsibility
- Separate concerns: UI rendering, business logic, data management, external communication
- React components should focus on presentation; logic belongs in services
- Rust commands should delegate to specialized services

**Example (Good):**
```typescript
// authService.ts - handles ONLY authentication logic
// gameService.ts - handles ONLY game management
// settingsService.ts - handles ONLY settings persistence
```

### Open/Closed Principle (OCP)
- Use composition and dependency injection over modification
- Extend behavior through interfaces and abstract classes
- Use strategy pattern for interchangeable behaviors
- Tauri commands should be thin wrappers around extensible services

**Example (Good):**
```typescript
interface DownloadStrategy {
  download(url: string, destination: string): Promise<void>;
}

class HttpDownloader implements DownloadStrategy { ... }
class TorrentDownloader implements DownloadStrategy { ... }
```

### Liskov Substitution Principle (LSP)
- Derived classes must be substitutable for their base classes
- Don't strengthen preconditions or weaken postconditions
- Maintain contracts defined by abstractions

### Interface Segregation Principle (ISP)
- Create focused, specific interfaces
- Clients shouldn't depend on methods they don't use
- Prefer multiple small interfaces over one large interface

**Example (Good):**
```typescript
interface Authenticatable {
  login(credentials: Credentials): Promise<User>;
  logout(): Promise<void>;
}

interface TokenRefreshable {
  refreshToken(): Promise<Token>;
}
```

### Dependency Inversion Principle (DIP)
- Depend on abstractions (interfaces/traits), not concrete implementations
- High-level modules should not depend on low-level modules
- Both should depend on abstractions

**Example (Good):**
```rust
trait FileStorage {
    fn save(&self, path: &Path, data: &[u8]) -> Result<()>;
    fn load(&self, path: &Path) -> Result<Vec<u8>>;
}

struct LocalFileStorage;
impl FileStorage for LocalFileStorage { ... }
```

## Core Coding Standards

### Small, Focused Functions
- **Maximum 20 lines** per function (aim for less)
- One level of abstraction per function
- If you need to comment sections within a function, extract those sections
- Extract nested logic into well-named helper functions

**Bad:**
```typescript
function processGameData(game: Game) {
  // Validate game
  if (!game.id || !game.name) throw new Error("Invalid game");
  
  // Download game files
  const url = getDownloadUrl(game.id);
  const response = await fetch(url);
  const data = await response.blob();
  
  // Save to disk
  await invoke('save_file', { path: game.installPath, data });
  
  // Update database
  await db.games.update(game.id, { installed: true });
}
```

**Good:**
```typescript
async function processGameData(game: Game): Promise<void> {
  validateGame(game);
  const data = await downloadGameFiles(game.id);
  await saveGameToDisk(game.installPath, data);
  await markGameAsInstalled(game.id);
}
```

### Pure Functions & No Side Effects
- Functions should return values, not mutate external state
- Make side effects explicit in function names (`save`, `update`, `fetch`)
- Separate pure logic from I/O operations
- Use immutable data structures where possible

**Good:**
```typescript
// Pure function
function calculateDownloadProgress(downloaded: number, total: number): number {
  return (downloaded / total) * 100;
}

// Side effect is explicit in name
async function updateDownloadProgress(gameId: string, progress: number): Promise<void> {
  await invoke('update_progress', { gameId, progress });
}
```

### DRY (Don't Repeat Yourself)
- Extract repeated logic into reusable functions
- Use utility functions for common operations
- Create shared types and interfaces
- Avoid copy-paste programming

### Clear, Self-Documenting Code
- Use descriptive variable and function names
- Avoid abbreviations unless universally understood (`id`, `url`, `http`)
- Boolean variables should read like questions: `isLoading`, `hasError`, `canDownload`
- Function names should be verbs: `fetchGames`, `validateInput`, `calculateTotal`

**Bad:**
```typescript
const d = new Date();
const usr = await getUsr();
const res = await proc(usr);
```

**Good:**
```typescript
const currentDate = new Date();
const currentUser = await getCurrentUser();
const validationResult = await validateUser(currentUser);
```

### Separation of Concerns

#### React Components (Presentation Layer)
- Focus on UI rendering and user interaction
- Delegate business logic to services
- Keep components under 200 lines
- Use custom hooks for complex state logic

```typescript
// ❌ Bad: Business logic in component
function GameCard({ game }) {
  const install = () => {
    fetch(`/api/games/${game.id}/download`)
      .then(res => res.blob())
      .then(data => invoke('save_file', { data }));
  };
  return <button onClick={install}>Install</button>;
}

// ✅ Good: Delegate to service
function GameCard({ game }) {
  const { installGame } = useGameService();
  return <button onClick={() => installGame(game.id)}>Install</button>;
}
```

#### Services (Business Logic Layer)
- Encapsulate business rules and workflows
- Handle state management
- Coordinate between UI and backend
- One service per domain concept

#### Tauri Commands (IPC Layer)
- Thin wrappers around Rust services
- Handle serialization/deserialization
- Map errors to appropriate types
- No business logic in commands

```rust
// ❌ Bad: Business logic in command
#[tauri::command]
async fn download_game(url: String) -> Result<(), String> {
    let response = reqwest::get(&url).await.unwrap();
    let bytes = response.bytes().await.unwrap();
    std::fs::write("game.zip", bytes).unwrap();
    Ok(())
}

// ✅ Good: Delegate to service
#[tauri::command]
async fn download_game(game_id: String, state: State<'_, AppState>) -> Result<(), String> {
    state.game_service
        .download_game(&game_id)
        .await
        .map_err(|e| e.to_string())
}
```

### Error Handling

#### TypeScript
- Use `try/catch` for async operations
- Create custom error types for different error categories
- Never silently swallow errors
- Provide meaningful error messages to users

```typescript
class GameInstallError extends Error {
  constructor(
    message: string,
    public readonly gameId: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'GameInstallError';
  }
}

async function installGame(gameId: string): Promise<void> {
  try {
    await downloadGameFiles(gameId);
    await extractGameArchive(gameId);
    await updateGameRegistry(gameId);
  } catch (error) {
    throw new GameInstallError(
      `Failed to install game ${gameId}`,
      gameId,
      error as Error
    );
  }
}
```

#### Rust
- Use `Result<T, E>` for operations that can fail
- Create custom error types with `thiserror`
- Propagate errors with `?` operator
- Log errors before returning to frontend

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum GameError {
    #[error("Game not found: {0}")]
    NotFound(String),
    
    #[error("Download failed: {0}")]
    DownloadError(#[from] reqwest::Error),
    
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}

pub async fn download_game(game_id: &str) -> Result<PathBuf, GameError> {
    let game = find_game(game_id)?;
    let bytes = fetch_game_data(&game.url).await?;
    let path = save_game_files(&bytes).await?;
    Ok(path)
}
```

### Type Safety

#### TypeScript
- Avoid `any` type (use `unknown` if necessary)
- Define interfaces for all data structures
- Use discriminated unions for state machines
- Leverage TypeScript's strict mode

```typescript
// ✅ Good: Type-safe state machine
type DownloadState = 
  | { status: 'idle' }
  | { status: 'downloading'; progress: number }
  | { status: 'completed'; path: string }
  | { status: 'error'; error: Error };

function renderDownloadStatus(state: DownloadState): string {
  switch (state.status) {
    case 'idle': return 'Ready to download';
    case 'downloading': return `Downloading: ${state.progress}%`;
    case 'completed': return `Saved to ${state.path}`;
    case 'error': return `Error: ${state.error.message}`;
  }
}
```

#### Rust
- Leverage the type system for compile-time guarantees
- Use newtypes for domain concepts
- Prefer owned types over references in public APIs
- Use `Option<T>` and `Result<T, E>` appropriately

```rust
// ✅ Good: Newtype for type safety
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct GameId(String);

impl GameId {
    pub fn new(id: String) -> Result<Self, String> {
        if id.is_empty() {
            return Err("GameId cannot be empty".to_string());
        }
        Ok(GameId(id))
    }
}
```

### Testing Considerations
- Write testable code (avoid global state)
- Inject dependencies for mocking
- Keep I/O at the boundaries
- One assertion per test (mostly)

### Code Organization

```
src/
├── components/          # React UI components
│   ├── [Feature]Screen.tsx
│   └── common/         # Reusable UI components
├── services/           # Business logic layer
│   ├── authService.ts
│   ├── gameService.ts
│   └── store.ts        # State management
├── hooks/              # Custom React hooks
├── utils/              # Pure utility functions
├── types/              # TypeScript type definitions
└── constants/          # Application constants

src-tauri/src/
├── commands/           # Tauri IPC commands (thin wrappers)
├── services/           # Rust business logic
├── models/             # Domain models
├── errors.rs           # Custom error types
└── main.rs             # App initialization
```

### Performance Guidelines
- Memoize expensive computations (`useMemo`, `useCallback`)
- Avoid unnecessary re-renders
- Lazy load large components
- Use pagination for large datasets
- Stream large file downloads
- Use async/await for I/O operations

### Security Guidelines
- Validate all user input
- Sanitize data before display
- Never trust frontend validation alone
- Use secure storage for sensitive data
- Implement proper authentication and authorization
- Avoid exposing internal paths or sensitive info in errors

## Naming Conventions

### TypeScript
- **Files**: `camelCase.ts` or `PascalCase.tsx` for components
- **Components**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces/Types**: `PascalCase`
- **Private fields**: prefix with `_` (when not using private keyword)

### Rust
- **Files**: `snake_case.rs`
- **Modules**: `snake_case`
- **Structs/Enums**: `PascalCase`
- **Functions/Variables**: `snake_case`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Traits**: `PascalCase`

## Code Review Checklist

Before suggesting code, verify:
- [ ] Does each function have a single, clear responsibility?
- [ ] Are functions under 20 lines?
- [ ] Are there any side effects? Are they explicit?
- [ ] Is the code DRY? Any duplication to extract?
- [ ] Are names self-explanatory?
- [ ] Is error handling comprehensive?
- [ ] Are types properly defined (no `any` in TS)?
- [ ] Is the abstraction level consistent?
- [ ] Does it follow the project's architecture?
- [ ] Can this be tested easily?

## Anti-Patterns to Avoid

### TypeScript/React
- ❌ Business logic in components
- ❌ Prop drilling (use context or state management)
- ❌ Large useEffect hooks (split into multiple effects)
- ❌ Inline anonymous functions in JSX (use useCallback)
- ❌ Mutating state directly
- ❌ Using `any` type

### Rust
- ❌ Unwrap/expect in library code (use `?` operator)
- ❌ String-based errors (use custom error types)
- ❌ Blocking operations on async runtime
- ❌ Large functions (split into smaller ones)
- ❌ Cloning unnecessarily (understand borrowing)
- ❌ Public fields in structs (use getters/setters)

## When in Doubt
1. **KISS**: Choose the simplest solution that works
2. **YAGNI**: Don't add features speculatively
3. **Refactor ruthlessly**: If code smells, improve it now
4. **Ask "Why?"**: Understand the requirement before coding
5. **Read existing code**: Follow established patterns in the codebase
