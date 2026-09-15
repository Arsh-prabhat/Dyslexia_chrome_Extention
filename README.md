# 📖 Dyslexia Reading Assistant — Chrome Extension (Manifest V3)

> **Read the web your way.**  
> A production-ready, accessibility-first Chrome Extension designed to make arbitrary webpages easier to read for people with dyslexia and other reading difficulties.

---

## 🌟 Key Features

1. **Assistive Typography Engine**
   - **Dyslexia-Friendly Fonts**: Instantly switch webpage fonts to **OpenDyslexic**, **Lexend**, or revert to the original site font.
   - **Granular Adjustments**: Tune **font size** (12px–32px), **line height** (1.2–2.5), **letter spacing** (0–4px), and **word spacing** (0–8px).
   - **Selective Presentation**: Modifies only readable content (`<p>`, `<h1>`-`<h6>`, `<li>`, `<blockquote`) without breaking site layout, navigation icons, buttons, or code blocks.

2. **Sequential Focus Mode**
   - Highlights reading units sequentially (**Word**, **Sentence**, or **Paragraph**).
   - Smoothly scrolls the active reading unit into view.
   - Observes dynamic webpage changes cleanly using `MutationObserver` without creating infinite loops.

3. **Text-to-Speech (TTS) Reader**
   - Built on the native **Web Speech API** (`SpeechSynthesis`).
   - Synchronized speech playback with Focus Mode visual highlights.
   - Full playback controls: **Previous**, **Play / Pause**, **Next**, and adjustable speeds (**0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x**).

4. **AI Text Simplification (Gemini Backend)**
   - Extracts page article text cleanly.
   - Handles large pages automatically via token-aware paragraph & sentence chunking (~3000 characters per request).
   - Rewrites complex text into shorter, simpler, dyslexia-friendly language while preserving key facts, names, dates, and structure.
   - Dual DOM View: Instant 1-click switching between `[ Original ]` and `[ Simplified ]` without destroying the original webpage state.

5. **Settings Persistence & Accessibility**
   - Saves preferences automatically using `chrome.storage.sync`.
   - 100% Keyboard Accessible (visible focus rings, standard Tab navigation, ARIA attributes).
   - Calm, non-distracting side panel UI designed for 300px–400px widths.

---

## 🏗️ Architecture & Security

```
chrome_extention/
├── manifest.json              # Manifest V3 (sidePanel, scripting, activeTab, storage, tabs)
├── vite.config.ts             # Vite build configuration for extension components
├── src/
│   ├── background/
│   │   └── service-worker.ts  # Side panel behavior & tab monitoring
│   ├── content/
│   │   ├── content-script.ts       # Entry point connecting engines & listening to messages
│   │   ├── accessibility-engine.ts # Injected CSS variables & typography application
│   │   ├── text-extractor.ts       # Semantic text node parser & chunking
│   │   ├── focus-mode.ts           # Sentence/Word highlight sequence tracker
│   │   ├── speech-engine.ts        # Modular Web Speech API wrapper
│   │   └── simplifier.ts           # Original vs Simplified DOM state manager
│   ├── sidepanel/             # React + TypeScript side panel UI
│   │   ├── App.tsx
│   │   └── components/        # Accessible UI controls
│   └── shared/                # Type definitions, message helpers, storage wrapper
├── server/
│   ├── server.js              # Standalone Node/Express backend calling Gemini API
│   └── .env.example
└── tests/                     # Unit test suite (Vitest)
```

### 🔐 Security & Secrets Protection
- **No hardcoded API keys**: The extension frontend bundle never contains API keys.
- **Backend Abstraction**: All AI simplification calls pass through a backend endpoint (`POST /api/simplify`).
- The backend reads `GEMINI_API_KEY` securely from its local `.env` environment file.

---

## 🚀 Getting Started

### 1. Build the Extension Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate assets and build production package:
   ```bash
   node scripts/generate-assets.js
   npm run build
   ```
   The compiled extension bundle will be generated in `dist/`.

### 2. Load the Extension into Google Chrome

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the `dist/` directory inside this project folder.
5. Click the **Dyslexia Reader** extension icon in your browser toolbar to open the Side Panel.

---

## 🤖 Gemini AI Backend Setup

To use the **✨ Simplify Text** feature:

1. Navigate to the `server/` directory:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and add your **Gemini API key** from [Google AI Studio](https://aistudio.google.com/):
   ```env
   GEMINI_API_KEY=AIzaSy...
   PORT=3000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   The server will run at `http://localhost:3000`.

5. In the extension Side Panel under **Settings & Actions** (⚙️ Options), the default backend URL is set to `http://localhost:3000/api/simplify`.

---

## 🧪 Testing

Run the automated test suite with Vitest:

```bash
npm test
```

This validates:
- Semantic text node filtering (excluding code, inputs, buttons, SVGs, nav elements).
- Paragraph and sentence chunking algorithms for large articles.
- Message contracts and restricted Chrome URL identification.

---

## 🔒 Privacy Policy & Data Handling

- **Local Presentation**: Webpage typography changes, font switching, and Focus Mode highlighting are performed entirely within your browser memory.
- **Storage**: User preferences (font choice, size, spacing, speed) are stored securely in `chrome.storage.sync`.
- **AI Simplification**: Webpage text is sent to the Gemini AI backend **only when you explicitly click "✨ Simplify Text"**.
- **No Browsing History**: Dyslexia Reader does not collect, track, or transmit your browsing history or personal identifiers.
- **Restricted Pages**: Chrome restricts content script injection on internal pages such as `chrome://` URLs, `edge://` URLs, and the Chrome Web Store. Dyslexia Reader gracefully displays an informative notice when on restricted pages.

---

## 🔮 Future Architecture & Roadmap

The codebase is built with modular abstraction layers ready for future extensions:
- **Personalized Reading Profiles**: Save custom presets for distinct reading scenarios.
- **Color Overlays & Reading Ruler**: Visual line guide tracking cursor position.
- **Syllable Highlighting & Vocabulary Explanations**: Interactive tooltips for difficult words.
- **Antigravity Platform Integration**: Cloud synchronization of reading preferences across devices.
