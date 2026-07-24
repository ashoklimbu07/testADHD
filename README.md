# ADHD App

A voice-first task planner built for ADHD brains. Speak a task out loud, and the app breaks it into small steps and slots it into your day — no typing, no friction, no decision fatigue.

Built with React, Vite, Tailwind CSS, and the Web Speech API.

## Features

- **Voice capture** — tap the mic and describe a task naturally
- **Automatic task breakdown** — turns a spoken task into bite-sized steps
- **Daily schedule & calendar view** — see what's planned for today and beyond
- **Progressive Web App** — installable, works offline via service worker

## Folder Structure

```
testADHD/
├── README.md                  # This file
└── adhd-app/                  # React + Vite application
    ├── index.html             # App entry HTML
    ├── package.json           # Dependencies & scripts
    ├── vite.config.js         # Vite build configuration
    ├── eslint.config.js       # Lint rules
    ├── public/                 # Static assets served as-is
    │   ├── favicon.svg
    │   ├── icon.svg
    │   ├── icons.svg
    │   ├── manifest.json      # PWA manifest
    │   └── sw.js               # Service worker
    └── src/
        ├── main.jsx            # App bootstrap
        ├── App.jsx             # Root component & app state
        ├── index.css           # Global styles (Tailwind)
        ├── constants.js        # Shared constants
        ├── assets/             # Images/icons used in components
        ├── components/
        │   ├── BottomNav.jsx
        │   ├── Fabs.jsx
        │   ├── atoms/          # Small reusable UI pieces (MicOrb, IconBtn, ...)
        │   ├── screens/        # Full-screen views (VoiceHome, Schedule, CalendarView, ...)
        │   └── sheets/         # Bottom-sheet/modal components (EventModal, StepsModal, ...)
        ├── hooks/               # Custom React hooks (voice capture, schedule, app actions, ...)
        └── utils/               # Pure helper functions (date, plan, seed, viewData)
```

## Getting Started

```bash
cd adhd-app
npm install
npm run dev
```

Open the printed local URL in your browser. Voice capture requires a browser that supports the Web Speech API (e.g. Chrome).

### Other scripts

```bash
npm run build      # Production build
npm run preview    # Preview the production build locally
npm run lint        # Run ESLint
```

## Tech Stack

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) for icons
- Web Speech API for voice input
