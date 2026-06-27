# TaskFlow Terminal
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-white)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222?logo=github)
A premium local-first task manager built with **React**, **TypeScript**, **Vite** and **Ant Design**. It is designed as a portfolio-ready productivity app with a deep black / chrome liquid-glass interface, task intelligence, priorities, due dates, analytics, import/export and Docker support.

<img width="610" height="500" alt="Снимок экрана 2026-06-27 021159" src="https://github.com/user-attachments/assets/0b2c31d6-3eba-4cbb-80ce-460dea51cd85" />
<img width="1238" height="440" alt="Снимок экрана 2026-06-27 021135" src="https://github.com/user-attachments/assets/ee96143e-1b0d-4310-a89c-ab4c48c28102" />
<img width="1250" height="669" alt="Снимок экрана 2026-06-27 021221" src="https://github.com/user-attachments/assets/d3cba3ab-86c4-4b13-945e-b01ed5166b79" />
<img width="1243" height="606" alt="Снимок экрана 2026-06-27 021141" src="https://github.com/user-attachments/assets/9405a89a-28a9-49ab-8a9a-d20e72b35019" />
<img width="1241" height="916" alt="Снимок экрана 2026-06-27 021108" src="https://github.com/user-attachments/assets/9a554b31-a868-4e29-935b-9ab8be9e9235" />


## Features

- Create, edit, complete, restore and archive tasks.
- Priority levels: low, medium, high and urgent.
- Optional due dates with overdue highlighting.
- Tags, descriptions and visual card customization.
- Search across title, description, tags, status and priority.
- Priority filter and sorting by last update, priority or due date.
- Analytics tab with priority-load bars, 7-day completion chart, focus index and key task statistics.
- Premium dark liquid-glass UI with subtle motion, silver tones and rounded composition.
- Task detail modal with timeline, metadata and quick actions.
- Smart daily plan that highlights the next best tasks by priority and deadline.
- Real archive flow: archive first, then delete forever from archive.
- Local-first persistence with `localStorage`.
- JSON import/export for backups and migration.
- User settings for card density, typography, accent color, glass intensity, motion intensity and compact mode.
- Responsive dashboard layout.
- Unit test coverage for the core create-task flow.
- Dockerized production build served by nginx.

## Tech Stack

- React 19
- TypeScript
- Vite
- Ant Design
- Day.js
- Vitest + Testing Library
- Docker + nginx

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

### Tests

```bash
npm test
```

### Linting and Type Check

```bash
npm run lint
npm run typecheck
```

## Docker

Build the image:

```bash
docker build -t taskflow-terminal .
```

Run the container:

```bash
docker run --rm -p 8080:80 taskflow-terminal
```

Open:

```text
http://localhost:8080
```

Or use Docker Compose:

```bash
docker compose up --build
```

## Project Structure

```text
.
├── .github/workflows/ci.yml
├── docs/screenshots/
├── public/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── test/
│   ├── types/
│   └── utils/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── vite.config.ts
```

## Deployment

This is a static Vite app. You can deploy the `dist/` folder to GitHub Pages, Netlify, Vercel, Cloudflare Pages or any static hosting provider.

For GitHub Pages, keep `base: './'` in `vite.config.ts` so the app works from a repository subpath.

## GitHub Repository Setup

Suggested repository description:

```text
Polished React + TypeScript task manager with priorities, analytics, local persistence and Docker support.
```

Suggested topics:

```text
react typescript vite antd task-manager productivity localstorage docker vitest frontend
```

## Notes

The app is local-first: tasks are stored in the browser. Clearing browser storage will remove local tasks unless you export a JSON backup first.

## License

MIT


## Senior UI redesign

This version focuses on a calmer product layout: equal header/content widths, cleaner board controls, reduced visual noise, a subtle animated background, and a Today's Focus queue that makes the app feel useful immediately.


## Productivity OS upgrade

The app now goes beyond basic task tracking: workload capacity, effort estimates, energy levels, project health, a smart focus queue, JSON backup/import, archive flow, and product-grade workflow settings.


## Visual redesign reset

The CSS was reset instead of patched: wider shell, deep black/chrome palette, larger hero, redesigned cockpit panels, cleaner controls and a visibly different premium product style.
