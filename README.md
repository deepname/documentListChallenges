# Document Manager - MVC Application

A modern single-page application built with **Vanilla TypeScript**, **Vite**, strict **MVC architecture** and the **KISS** and **DRY** principles of programming. The **AAA** (Arrange, Act, Assert) testing pattern was applied.

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

# UnitTest 
npm run test

# UnitTest with UI
npm run test:ui

# UnitTest with coverage
npm run test:coverage

# UnitTest with run
npm run test:run

# Run all E2E tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```text
e2e/
├── helpers/
│   └── page-objects.ts    # Reusable page object models (DRY)
└── *.spec.ts              # Test specifications
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
│   ├── documentUtils.ts     # Document transformation utilities
│   ├── htmlUtils.ts         # HTML escaping utilities
│   └── storageUtils.ts      # localStorage utilities
├── views/
|   ├── Components/
|   |   ├── DocumentCard.tsx
|   |   ├── DocumentList.tsx
|   |   ├── DocumentModal.tsx
|   |   ├── DocumentView.tsx
|   |   ├── SortButton.tsx
|   |   └── ViewModeToggle.tsx
│   └── DocumentView.ts      # UI rendering
├── main.ts                  # Application entry point
└── style.css                # Global styles
```

## 🔌 API & WebSocket Integration

### Initial Document Loading

The application fetches initial documents from `http://localhost:8080/documents` on startup.

```json
{
   "Attachments": [
      "European Amber Lager",
      "Wood-aged Beer"
   ],
   "Contributors": [
      {
         "ID": "1b41861e-51e2-4bf4-ba13-b20f01ce81ef",
         "Name": "Jasen Crona"
      },
      {
         "ID": "2a1d6ed0-7d2d-4dc6-b3ea-436a38fd409e",
         "Name": "Candace Jaskolski"
      },
      {
         "ID": "9ae28565-4a1c-42e3-9ae8-e39e6f783e14",
         "Name": "Rosemarie Schaden"
      }
   ],
   "CreatedAt": "1912-03-08T06:01:39.382278739Z",
   "ID": "69517c79-a4b2-4f64-9c83-20e5678e4519",
   "Title": "Arrogant Bastard Ale",
   "UpdatedAt": "1952-02-29T22:21:13.817038244Z",
   "Version": "5.3.15"
},
```

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
  - TypeScript: A TypeScript compiler that converts TypeScript code to JavaScript. It also provides type checking.
- **Vite**: Fast build tool and dev server
  - Vite: A fast and modern build tool that includes a development server, bundling, and production optimization.
- **Native WebSocket API**: Real-time communication
- **CSS3**: Modern styling with CSS variables
- **ES Modules**: Modern JavaScript modules

## 🔍 Code Quality

The project uses **ESLint** and **Prettier** to maintain code quality and consistency:

- **ESLint**: TypeScript-aware linting with recommended rules

   ***Dependencies***

  - typescript-eslint/eslint-plugin: An ESLint plugin specifically for TypeScript that provides additional rules for TypeScript code, such as unused type detection and TypeScript best practices.

  - typescript-eslint/parser: An ESLint parser that allows you to parse TypeScript code. It is necessary for ESLint to understand TypeScript syntax.

  - eslint: The main linting tool that analyzes code for errors, style issues, and bad practices. It runs rules configured in .eslintrc.json

  - eslint-config-prettier: An ESLint configuration that disables rules that conflict with Prettier, allowing both tools to work together without conflicts.

  - eslint-plugin-prettier: A plugin that integrates Prettier with ESLint, allowing ESLint to execute Prettier's formatting rules.

- **Prettier**: Automatic code formatting

   ***Dependencies***

  - prettier: A code formatter that automatically formats code consistently according to rules configured in .prettierrc.json

- **Pre-configured**: Works out of the box with sensible defaults

- **Auto-fix**: Most issues can be fixed automatically

### Configuration

- `.eslintrc.json` - ESLint rules and TypeScript integration
- `.prettierrc.json` - Code formatting preferences
- `.vscode/settings.json` - Editor settings for auto-format on save
- Integrated with TypeScript for type-aware linting

### Unit Testing with Vitest

We use the AAA pattern, or Arrange, Act, Assert, is a design pattern for writing unit tests that divides each test into three clear and sequential phases. In the Arrange phase, the data and objects needed for the test are set up; in the Act phase, the code under test is executed; and in the Assert phase, it is verified that the result is as expected. This pattern promotes readability, maintainability, and clarity in test writing.

#### Dependencies Unit test

- vitest/coverage-v8: A plugin for Vitest that generates code coverage reports using V8. It shows what percentage of the code is covered by tests.

- vitest/ui: A web-based graphical interface for Vitest that allows you to run and view test results in a browser.

- happy-dom: A lightweight and fast DOM environment for testing. It simulates the browser's DOM to run tests that interact with HTML elements.

- vitest: A modern and fast testing framework specifically designed for Vite projects. It runs unit and integration tests.

### End-to-End Tests

E2E tests using Playwright.

#### Dependencies e2e

- @playwright/test: A testing framework for web applications that provides a set of tools for automating browser interactions and testing web applications.

### Browser Compatibility

This application is optimized for the **last 2 versions of Chrome**.

***browserslist***: Defines which browsers the project should support. It is used to configure build tools such as Babel or PostCSS.
***browserslist-to-esbuild***: Bridges the Browserslist and esbuild (the bundler used by Vite) to optimize the build for the target browsers.


## 📝 License

MIT
