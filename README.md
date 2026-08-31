# ⚔️ Game of Thrones — Cinematic Scrollytelling Experience

An immersive, scroll-driven interactive journey through the Seven Kingdoms, the Great Houses of Westeros, and the relentless fight for the Iron Throne. Built with **React**, **Vite**, and **GSAP ScrollTrigger**.

---

## 🌟 Key Features

- **🎬 Fullscreen Cinematic Video Hero (100vh)**:
  - High-definition video loop with atmospheric radial & linear gradient overlays.
  - Slow typography tracking and entrance animations.
  - Floating scroll indicator guiding the user into the realm.

- **📜 "A World Divided by Power" Transition**:
  - Sticky scroll-scrubbed typography reveal introducing the Six Great Houses.

- **🏰 6 Bespoke House Story Chapters**:
  - **House Stark**: Cold glacial tones, Direwolf reveal, *"Winter Is Coming"*.
  - **House Lannister**: Dark gold & black aura, golden lion halo, *"Hear Me Roar"*.
  - **House Targaryen**: Molten red & deep shadows, dominating dragon scale, *"Fire and Blood"*.
  - **House Baratheon**: Stormy bronze & dark gold, crowned stag, *"Ours Is the Fury"*.
  - **House Greyjoy**: Abyssal oceanic tones with subtle wave drift, *"We Do Not Sow"*.
  - **House Tyrell**: Elegant dark emerald & antique gold blooming reveal, *"Growing Strong"*.

- **👑 Endgame & Interactive Allegiance Selector**:
  - Dramatic scroll verdict: *"In the Game of Thrones... You Win or You Die."*
  - Interactive house selector allowing users to pledge allegiance with live sigil, lore, and atmospheric preview updates.

- **✨ Atmospheric Polish**:
  - Ultra-thin gold vertical scroll progress tracker.
  - Subtle film grain and cinematic vignette overlay.
  - Royal serif typography with Google Fonts (*Cinzel*, *Cinzel Decorative*, *Cormorant Garamond*).
  - Fully responsive across desktop, tablet, and mobile devices with zero horizontal overflow.

---

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 8
- **Animation Engine**: GSAP 3 (ScrollTrigger)
- **Styling**: Vanilla CSS (Hardware-accelerated transforms & CSS variables)
- **Typography**: Google Fonts (Cinzel, Cinzel Decorative, Cormorant Garamond, Plus Jakarta Sans)

---

## 📁 Project Structure

```
GOT-main/
├── vite-project/
│   ├── public/
│   │   ├── images/              # High-resolution Great House sigils (one.jpg - six.jpg)
│   │   └── video/               # Cinematic intro video (one.mp4)
│   ├── src/
│   │   ├── assets/              # Static vector & graphic assets
│   │   ├── components/
│   │   │   ├── AmbientAtmosphere.jsx  # Film grain & vignette overlay
│   │   │   ├── ScrollProgress.jsx     # Minimalist fixed gold progress bar
│   │   │   ├── HeroVideo.jsx          # 100vh Fullscreen video opening
│   │   │   ├── DividedWorld.jsx       # Pinned sticky transition section
│   │   │   ├── HouseChapter.jsx       # Reusable cinematic house chapter
│   │   │   ├── ClimaxSection.jsx      # Pinned endgame & allegiance selector
│   │   │   └── CinematicFooter.jsx    # Minimalist tribute footer
│   │   ├── data/
│   │   │   └── housesData.js          # Lore, color themes & asset configs
│   │   ├── App.jsx              # Main Scrollytelling orchestrator
│   │   ├── App.css              # Cinematic styling & layout rules
│   │   ├── index.css            # Baseline tokens, resets & scrollbar
│   │   └── main.jsx             # React entry point
│   ├── index.html               # Fonts, viewport & metadata
│   ├── package.json             # Scripts & dependencies
│   └── vite.config.js           # Vite configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JustXutkarsh/GOT-Annimated-web.git
   cd GOT-Annimated-web/vite-project
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📜 Disclaimer & Credits

This project is a cinematic tribute and portfolio piece. All Game of Thrones trademarks, names, imagery, lore, and video assets are property of HBO and George R.R. Martin.
