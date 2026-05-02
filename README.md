# 🍿 CinePulse: The Future of Cinematic Discovery

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CinePulse** isn't just another movie tracker—it's a premium, high-performance streaming discovery engine. Designed with a sleek, dark-mode glassmorphic aesthetic, it brings a cinematic experience directly to your browser.

---

## 📽️ Visual Tour

| **Home Dashboard** | **Deep Discovery** |
| :---: | :---: |
| ![Home](./public/screenshots/home.png) | ![Detail](./public/screenshots/detail.png) |
| *Immersive horizontal scrolling and dynamic hero sections.* | *Comprehensive metadata and cast details.* |

| **Cinematic Player** | **Viewer Analytics** |
| :---: | :---: |
| ![Player](./public/screenshots/player.png) | ![Stats](./public/screenshots/stats.png) |
| *Seamless streaming with integrated controls.* | *Data-driven insights into your viewing habits.* |

---

## ✨ Why CinePulse?

- **💎 Premium Design**: A state-of-the-art UI utilizing glassmorphism, fluid micro-animations, and a curated dark-mode palette.
- **🧠 Intelligent Pickers**: Can't decide? Use **Decision Mode** (mood-based) or **Quick Pick** to find your next favorite movie in seconds.
- **📊 Personal Insights**: A dedicated stats dashboard tracks your total watch time, favorite genres, and viewing frequency.
- **📱 Mobile-First Native Feel**: Experience smooth, 60fps transitions and gesture-friendly navigation on any device.
- **🔍 Global Search**: Lightning-fast search functionality powered by the TMDB ecosystem.

---

## 🛠️ Built With

<p align="left">
  <img src="https://skillicons.dev/icons?i=react,tailwind,vite,express,firebase,ts" />
</p>

- **Frontend**: React 19, Vite, Tailwind CSS 4.0
- **Animations**: `motion/react` (Framer Motion)
- **Icons**: Lucide React
- **API**: TMDB (The Movie Database)
- **Backend**: Express (Vite Proxy Middleware)

---

## 🚀 Get Started in 60 Seconds

### 1. Clone & Install
```bash
git clone https://github.com/madireis/cinepulse.git
cd cinepulse
npm install
```

### 2. Configure API
Create a `.env` file and add your TMDB API Key:
```env
TMDB_API_KEY=your_api_key_here
```

### 3. Launch
```bash
npm run dev
```
Navigate to `http://localhost:3000` and start your journey.

---

## ⚠️ Disclaimer

This project is for **educational purposes only**. CinePulse is a frontend demonstration of modern web engineering.

- **No Content Hosting**: This application does not host or distribute copyrighted material.
- **Metadata**: All content info is provided via the [TMDB API](https://www.themoviedb.org/).
- **Legal Compliance**: Users are responsible for ensuring their usage aligns with local streaming laws.


---

## 🗺️ Roadmap

> CinePulse is actively evolving. Here's what's shipped and what's coming next.

### ✅ Shipped

| | Feature |
|---|---|
| ✅ | Premium dark-mode UI with glassmorphism & micro-animations |
| ✅ | TMDB integration — trending, popular, top-rated, upcoming |
| ✅ | Full Movie & TV Show detail pages with trailers |
| ✅ | **Streaming player** via embedded backend provider |
| ✅ | TV episode picker — season/episode navigation |
| ✅ | **Decision Mode** — mood-based movie picker |
| ✅ | **Quick Pick** — instant random suggestion |
| ✅ | Watchlist — save movies & shows locally |
| ✅ | Watch history tracking |
| ✅ | **Personal Analytics** dashboard — genre heatmap, watch time, streaks |
| ✅ | Global search — movies, TV shows, and **actors** |
| ✅ | **Actor pages** — full filmography with movie/TV filter |
| ✅ | Cast cards linked to actor profiles across all pages |
| ✅ | Dynamic episode headers — title & doc tab update on episode change |
| ✅ | Hard-reload episode switching to bypass provider cache |
| ✅ | SEO meta tags, keywords, and dynamic document titles |
| ✅ | Mobile-first responsive layout with slide-out nav |
| ✅ | Removed auth/sign-in — fully open, no account needed |

---

### 🔜 Coming Soon

| | Feature | Priority |
|---|---|---|
| 🔲 | **Multi-provider support** — fallback between VidSrc, VidSrc2, SuperEmbed, 2Embed | 🔥 High |
| 🔲 | Provider selector UI — let user pick their preferred source | 🔥 High |
| 🔲 | **Continue Watching** row on home dashboard | 🔥 High |
| 🔲 | Trailer auto-play in hero section on hover | ⚡ Medium |
| 🔲 | Advanced filters — runtime, year range, quality, language | ⚡ Medium |
| 🔲 | **Collections & franchises** — view full MCU, Star Wars etc. | ⚡ Medium |
| 🔲 | Keyboard shortcuts — space to pause, arrow keys for episodes | ⚡ Medium |
| 🔲 | Director & crew pages (similar to actor pages) | ⚡ Medium |
| 🔲 | Progressive Web App (PWA) — install on mobile | 🧊 Low |
| 🔲 | Dark/light theme toggle | 🧊 Low |
| 🔲 | Export watch history as CSV | 🧊 Low |

---

## 📝 License
Licensed under the [MIT License](LICENSE).

<p align="center">
  <i>Built with ❤️ for the cinematic community.</i>
</p>
