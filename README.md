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

## 🌐 Browser Compatibility

This application is optimized for the **last 2 versions of Chrome** (130+). 

See [BROWSER_COMPATIBILITY.md](./BROWSER_COMPATIBILITY.md) for detailed compatibility information.

## 📝 License

MIT
