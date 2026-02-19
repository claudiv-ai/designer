# @claudiv/designer

Web-based visual editor for CDML files. Provides a real-time, bidirectional editing experience — changes in the designer sync to `.cdml` files on disk, and file changes reflect instantly in the UI.

## Tech Stack

- **Frontend**: React 19 + Vite 6 + Tailwind CSS v4
- **Backend**: Express 5 + WebSocket (ws)
- **File watching**: Chokidar for live file system sync

## Installation

```bash
npm install -g @claudiv/cli
```

The designer ships as part of the `@claudiv/cli` package.

## Usage

```bash
claudiv designer --open
```

This starts the designer server and opens the UI in your default browser.

## Architecture

```
┌─────────────────────┐     WebSocket      ┌──────────────────┐
│   React Frontend    │◄──────────────────►│  Express Backend  │
│                     │   bidirectional     │                   │
│  - Component tree   │   sync             │  - File watcher   │
│  - Property editor  │                    │  - CDML parser    │
│  - Interface view   │                    │  - Diff engine    │
│  - Plan questions   │                    │  - File writer    │
└─────────────────────┘                    └──────────────────┘
                                                    │
                                                    ▼
                                           ┌──────────────────┐
                                           │  .cdml files      │
                                           │  on disk           │
                                           └──────────────────┘
```

**Frontend** renders a visual component tree with property editing, interface inspection, and plan question workflows.

**Backend** watches the project directory for `.cdml` file changes, parses them using `@claudiv/core`, and pushes updates over WebSocket. Edits made in the UI are written back to disk atomically.

**Bidirectional sync** ensures the designer is always consistent with the file system — edit in your IDE or the designer interchangeably.

## Development

```bash
pnpm install
pnpm dev
```

This starts both the Vite dev server (frontend) and the Express backend concurrently.

## License

MIT
