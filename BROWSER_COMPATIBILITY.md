# Browser Compatibility

## Target Browsers
This application is designed to be compatible with the **last 2 versions of Chrome**.

## Automated Configuration
The browser targeting is **fully automated** and requires no manual updates:

- **Browserslist Query**: `last 2 Chrome versions` (in `.browserslistrc`)
- **Vite Build Target**: Automatically resolved via `browserslist-to-esbuild`
- **TypeScript Target**: `ES2020`

### How It Works
1. `.browserslistrc` contains the query: `last 2 Chrome versions`
2. `vite.config.ts` uses `browserslistToEsbuild()` to automatically convert the query
3. At build time, the current last 2 Chrome versions are resolved dynamically
4. No manual version updates needed!

## Features Used & Compatibility

### JavaScript APIs
All JavaScript features used in this application are fully supported in Chrome 130+ (Oct 2024):

| Feature | Chrome Support | Status |
|---------|---------------|--------|
| `crypto.randomUUID()` | Chrome 92+ | ✅ Supported |
| `querySelector/querySelectorAll` | Chrome 1+ | ✅ Supported |
| `addEventListener` | Chrome 1+ | ✅ Supported |
| `classList` (add/remove) | Chrome 8+ | ✅ Supported |
| `textContent` | Chrome 1+ | ✅ Supported |
| `innerHTML` | Chrome 1+ | ✅ Supported |
| `Array.map/forEach` | Chrome 1+ | ✅ Supported |
| `setTimeout` | Chrome 1+ | ✅ Supported |
| `JSON.parse/stringify` | Chrome 3+ | ✅ Supported |
| `WebSocket` | Chrome 4+ | ✅ Supported |
| Template literals | Chrome 41+ | ✅ Supported |
| Arrow functions | Chrome 45+ | ✅ Supported |
| Classes | Chrome 49+ | ✅ Supported |
| `const`/`let` | Chrome 49+ | ✅ Supported |
| Async/await | Chrome 55+ | ✅ Supported |
| ES Modules | Chrome 61+ | ✅ Supported |

### CSS Features
All CSS features are supported in Chrome 130+:

| Feature | Chrome Support | Status |
|---------|---------------|--------|
| CSS Grid | Chrome 57+ | ✅ Supported |
| Flexbox | Chrome 29+ | ✅ Supported |
| CSS Variables | Chrome 49+ | ✅ Supported |
| CSS Transitions | Chrome 26+ | ✅ Supported |
| Border Radius | Chrome 4+ | ✅ Supported |
| Box Shadow | Chrome 10+ | ✅ Supported |

## Build Process
The build process uses Vite with **automated Chrome targeting**:
- Automatically detects last 2 Chrome versions at build time
- No unnecessary polyfills
- Modern JavaScript output
- Optimized bundle size
- Zero manual configuration updates required

## Setup & Testing

1. **Install dependencies** (includes browser targeting packages):
   ```bash
   npm install
   ```

2. **Build for production**:
   ```bash
   npm run build
   ```
   The build automatically targets the current last 2 Chrome versions.

3. **Test compatibility**:
   ```bash
   npm run preview
   ```
   Then test in the latest Chrome versions.
