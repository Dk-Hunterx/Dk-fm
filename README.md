# DK Fm - Audio Story & Drama Streaming Platform 🎧

A modern, full-featured episodic audio storytelling and drama streaming web application built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**.

DK Fm provides an immersive audio listening experience inspired by premier audio story and serialized fiction platforms (such as Pocket FM, Audible, and Spotify Audiobooks).

---

## 🌟 Key Features

- **Serialized Audio Streaming**: Stream high-quality audio stories across genres including Romance, Thriller, Sci-Fi, Fantasy, Horror, and Mystery.
- **Persistent Player & Mini Player**:
  - Full-screen audio player with interactive progress waveform scrub bar.
  - Floating mini-player that remains accessible while browsing stories and categories.
  - Playback speed control (0.75x, 1.0x, 1.25x, 1.5x, 2.0x).
  - Quick 10-second skip forward and rewind buttons.
  - Intelligent Sleep Timer (15 min, 30 min, 45 min, 60 min, or End of Episode).
  - Episode queue management with auto-play next episode.
- **Offline & IndexedDB Persistence**:
  - Offline download management using browser IndexedDB.
  - Resumes playback from exact timestamps across sessions.
  - Keeps track of completed episodes and listening history.
- **Curated Discover & Search**:
  - Full-text search across titles, synopses, authors, and narrators.
  - Filter by category, status (Completed, Ongoing), and access tier (Free vs. Premium).
  - Sort by trending, most popular, highest rated, and newest releases.
- **User Library & Personalization**:
  - Bookmarked favorites and "Continue Listening" shelves.
  - Profile customization (display name, avatar, email).
  - Real-time listening statistics (total stream hours, episodes completed, favorites).
- **Admin Management Studio**:
  - Story management: Create, update, or remove stories with custom cover art and metadata.
  - Episode manager: Single and bulk episode upload with durations and status.
  - Category manager: Organize genres with custom color gradients and descriptions.
  - Instant demo role switcher: Toggle seamlessly between Listener and Admin roles.

---

## 🚀 Quick Start (Run Locally)

### 1. Prerequisites
Make sure you have installed on your computer:
- **Node.js**: Version `18.0.0` or higher (Node 20+ LTS recommended)
- **Package Manager**: `npm` (included with Node.js), or `pnpm` / `yarn` / `bun`

Verify your Node version:
```bash
node -v
npm -v
```

### 2. Extract the Source Code
If you downloaded the `.zip` archive, extract it to your desired directory:
```bash
unzip dk-fm-audio-app-source.zip -d dk-fm-app
cd dk-fm-app
```

### 3. Install Dependencies
Install all project dependencies using npm:
```bash
npm install
```
*(Alternatively, you can use `pnpm install`, `yarn install`, or `bun install`)*

### 4. Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```
*(Optional: Provide any API keys if extending external integrations. The app runs fully locally out-of-the-box with built-in mock audio generation and local persistence.)*

### 5. Launch the Development Server
Run the local Vite development server:
```bash
npm run dev
```

You should see output similar to:
```text
  VITE v6.x.x  ready in 250 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open your browser and navigate to **`http://localhost:3000`** to start listening!

---

## 🛠 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local development server at `http://localhost:3000` with hot reload. |
| `npm run build` | Compiles TypeScript and builds production-optimized static assets to `/dist`. |
| `npm run preview` | Serves the production build locally to test the production bundle. |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) to verify types. |
| `npm run clean` | Cleans up the `dist` build directory. |

---

## 📂 Project Architecture

```text
├── index.html                   # HTML entry point with meta tags & Google Fonts
├── package.json                 # Project dependencies and script definitions
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS plugin
├── .env.example                 # Example environment variables template
├── .gitignore                   # Git ignore rules for node_modules & build artifacts
├── README.md                    # Comprehensive documentation and setup instructions
├── metadata.json                # Applet configuration and capabilities
├── public/                      # Static assets served at root
│   └── dk-fm-audio-app-source.zip # Downloadable ZIP package of this source code
└── src/
    ├── main.tsx                 # React DOM root entry
    ├── App.tsx                  # Main router and app layout container
    ├── index.css                # Global stylesheet & Tailwind CSS import
    ├── types/
    │   └── index.ts             # TypeScript interfaces (Story, Episode, User, etc.)
    ├── data/
    │   └── initialData.ts       # Preloaded audio stories, episodes, and demo users
    ├── context/
    │   ├── AppContext.tsx       # Global state (stories, auth, filters, user roles)
    │   ├── AudioContext.tsx     # Audio engine, playback controls, queue & timer
    │   └── DownloadContext.tsx  # Offline download management & IndexedDB sync
    ├── utils/
    │   ├── formatters.ts        # Time, duration, and number formatting helpers
    │   └── indexedDB.ts         # Browser IndexedDB wrapper for audio caching
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx       # Top navigation, quick search, and user menu
    │   │   └── BottomNav.tsx    # Mobile navigation bar
    │   ├── home/
    │   │   └── HomePage.tsx     # Hero banner, Continue Listening, Top Trending
    │   ├── discover/
    │   │   └── DiscoverPage.tsx # Genre filtering, search results, category pills
    │   ├── story/
    │   │   └── StoryDetailPage.tsx # Story synopsis, episode tracklist, reviews
    │   ├── player/
    │   │   ├── MiniPlayer.tsx   # Persistent bottom audio dock
    │   │   └── FullPlayerModal.tsx # Full-screen audio player with controls & timer
    │   ├── library/
    │   │   └── LibraryPage.tsx  # Favorites, downloads, and listening history
    │   ├── profile/
    │   │   └── ProfilePage.tsx  # User profile, statistics, and role switching
    │   ├── admin/
    │   │   └── AdminDashboard.tsx # Comprehensive admin panel for content management
    │   ├── auth/
    │   │   └── AuthModal.tsx    # Sign In and Sign Up modal
    │   └── common/
    │       ├── StoryCard.tsx    # Reusable story card with play preview
    │       └── ExportModal.tsx  # In-app Source Code Exporter & download manager
    └── assets/
        └── images/              # High-quality cover art assets for stories
```

---

## 💡 Tips & Local Development Notes

1. **Audio Playback in Modern Browsers**:
   - Modern browsers (Chrome, Safari, Firefox, Edge) restrict audio autoplay until the user interacts with the page (clicks anywhere). Once you click play on any story or episode, audio will stream seamlessly.
2. **Offline Mode**:
   - The app uses the browser's native `IndexedDB` API. Episode downloads and listening progress persist locally on your machine even across page reloads.
3. **Admin Panel Access**:
   - You can test Admin features at any time! Click your profile avatar in the top right (or visit the Profile page) and toggle **"Admin Account"** to access the Admin Panel.
4. **Port Configuration**:
   - To run on a different port (e.g. 5173), modify the `scripts.dev` entry in `package.json` to:
     `"dev": "vite --port=5173"`

---

## 📄 License
This source code is provided for personal and production use.
Enjoy building with **DK Fm**! 🎧
