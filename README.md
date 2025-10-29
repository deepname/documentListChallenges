# Document Manager - MVC Application

A modern single-page application built with **Vanilla TypeScript**, **Vite**, and strict **MVC architecture** for managing documents with real-time notifications.

## 🏗️ Architecture

### MVC Pattern
- **Model** (`src/models/`): Document data structures and types
- **View** (`src/views/`): UI rendering and presentation logic
- **Controller** (`src/controllers/`): Business logic and coordination

### Centralized State Management
- **Store** (`src/store/Store.ts`): Singleton pattern for global state
- Observer pattern for reactive updates
- Immutable state access

## ✨ Features

- ✅ **Offline Support**: Works without server connection, data persists in localStorage
- ✅ **Auto-Sync**: Automatically reconnects and syncs when server becomes available
- ✅ **Document Grid View**: Responsive card-based layout
- ✅ **Real-time Notifications**: WebSocket integration for live updates
- ✅ **Create Documents**: Add new documents with collaborators
- ✅ **Multi-field Sorting**: Sort by name, version, or creation date
- ✅ **Toggle Sort Order**: Ascending/descending with visual indicators
- ✅ **Responsive Design**: Mobile-friendly interface

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Chrome 130+ (last 2 versions recommended)

### Installation

```bash
# Install dependencies (includes automated browser targeting)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check
```

The application will be available at `http://localhost:3000`

### Browser Targeting Setup

The application uses **automated browser targeting** to ensure compatibility with the last 2 Chrome versions:

1. **Install browser targeting packages** (if not already installed):
   ```bash
   npm install --save-dev browserslist browserslist-to-esbuild
   ```

2. **Configuration is automatic** - the `.browserslistrc` file contains:
   ```
   last 2 Chrome versions
   ```

3. **Build process automatically resolves** the current Chrome versions at build time - no manual updates needed!

## 📁 Project Structure

```
src/
├── controllers/
│   └── DocumentController.ts # Business logic
├── models/
│   ├── Document.ts          # Document data model
│   └── Sockets.ts           # WebSocket notification types
├── services/
│   ├── ApiService.ts        # HTTP API client
│   └── WebSocketService.ts  # Real-time communication
├── store/
│   └── Store.ts             # Centralized state management
├── utils/
│   └── htmlUtils.ts         # Shared utility functions
├── views/
│   └── DocumentView.ts      # UI rendering
├── main.ts                  # Application entry point
└── style.css                # Global styles
```

## 🔌 API & WebSocket Integration

### Initial Document Loading
The application fetches initial documents from `http://localhost:8080/documents` on startup.

### Real-time Updates
WebSocket notifications are received on `ws://localhost:8080/notifications` in this format:

```json
{
  "Timestamp": "2020-08-12T07:30:08.28093+02:00",
  "UserID": "3ffe27e5-fe2c-45ea-8b3c-879b757b0455",
  "UserName": "Alicia Wolf",
  "DocumentID": "f09acc46-3875-4eff-8831-10ccf3356420",
  "DocumentTitle": "Edmund Fitzgerald Porter"
}
```

The app gracefully handles connection failures and attempts automatic reconnection.

## 💾 Offline Support

The application works seamlessly without a server connection:

- **localStorage Persistence**: All documents are automatically saved to browser localStorage
- **Offline First**: App loads instantly with cached data, even without network
- **Auto-Reconnection**: WebSocket automatically reconnects when server becomes available (5 attempts, 3s delay)
- **Zero Data Loss**: Documents created offline are preserved and available when connection restores

### How It Works
1. Documents are saved to localStorage on every change
2. On app startup, cached documents load immediately
3. API fetch runs in background (fails gracefully if offline)
4. WebSocket attempts connection and auto-reconnects
5. All features work offline - create, sort, view documents

## 🎨 Design Principles

- **KISS**: Simple, straightforward implementations
- **DRY**: Reusable components and utilities
- **Separation of Concerns**: Clear MVC boundaries
- **Type Safety**: Full TypeScript coverage
- **Immutability**: State updates through controlled methods

## 🛠️ Technologies

- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Native WebSocket API**: Real-time communication
- **CSS3**: Modern styling with CSS variables
- **ES Modules**: Modern JavaScript modules

## 🔍 Code Quality

The project uses **ESLint** and **Prettier** to maintain code quality and consistency:

- **ESLint**: TypeScript-aware linting with recommended rules
- **Prettier**: Automatic code formatting
- **Pre-configured**: Works out of the box with sensible defaults
- **Auto-fix**: Most issues can be fixed automatically

### Configuration
- `.eslintrc.json` - ESLint rules and TypeScript integration
- `.prettierrc.json` - Code formatting preferences
- `.vscode/settings.json` - Editor settings for auto-format on save
- Integrated with TypeScript for type-aware linting

### Setup
1. Run `npm install` to install ESLint and Prettier
2. (Optional) Install VS Code extensions: ESLint and Prettier
3. Code will auto-format on save and show linting errors inline

## 🌐 Browser Compatibility

This application is optimized for the **last 2 versions of Chrome** (130+). 

See [BROWSER_COMPATIBILITY.md](./BROWSER_COMPATIBILITY.md) for detailed compatibility information.

## 📝 License

MIT
