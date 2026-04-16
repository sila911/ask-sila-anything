# Ask Sila Story Studio

A frontend-first React app where users submit questions, and admins create answer images for stories.

## What It Does

### User Flow
- Users only see the original ask page.
- Users can submit a question (no customization controls).
- Questions are stored locally in browser storage.

### Admin Flow
- Admin login is hidden behind a footer trigger (`Sila`).
- Admin access requires password (first login sets it on that browser).
- Optional encrypted admin link can be generated and shared.
- Admin selects a user question, writes an answer, and generates a styled story image.

### Story Generator
- Renders question (top) and answer (bottom) in one image.
- Shows asked timestamp in format like `Apr 14, 26 | 00:04:58` (top-right).
- Supports image copy/download and quick open to IG/FB story pages.

### Admin Dashboard
- Metrics: Questions, Pending, Designs, Rendered, Copies, Downloads, Share Clicks.
- Responsive cards and responsive recent-events view.
- Popup toast card feedback for admin actions.

## Important Security Note

Current admin protection is frontend/browser-level (localStorage + Web Crypto). This is good for local/private usage, but not full production-grade backend security.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Icons
- Web Crypto API (admin token/password utility)
- LocalStorage (questions, designs, events)

## Setup

### Prerequisites
- Node.js 16+
- npm

### Install

```bash
npm install
```

### Run (Frontend Only)

```bash
npm run dev:frontend
```

Open `http://localhost:5173`.

### Run (Existing Full Dev Script)

```bash
npm run dev
```

This starts both the old server process and frontend. Current app flow works frontend-only.

### Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## Admin Access

1. Open app.
2. Click `Sila` in footer.
3. Enter password:
- First time: creates admin password on this browser.
- Next times: must match existing password.

After login, admin workspace includes:
- `Create`: answer generator
- `Library`: saved answer cards
- `Admin`: analytics dashboard

src/
├── components/              # UI building blocks and page views
│   ├── AdminAuthModal.jsx   # Popup for admin login/authentication
│   ├── AdminDashboardPage.jsx # Main view for administrative tasks
│   ├── AdminToastCard.jsx   # Notification alerts for admin actions
│   ├── CreateDesignPage.jsx # Interface for uploading or creating designs
│   ├── Footer.jsx           # Global site footer
│   ├── Header.jsx           # Global navigation bar and branding
│   ├── LibraryPage.jsx      # Gallery or collection view of items
│   ├── NavTabs.jsx          # Tab-based navigation component
│   ├── Profile.jsx          # User profile and settings display
│   ├── QuestionForm.jsx     # Form for user input or feedback
│   └── ThankYouModal.jsx    # Success confirmation popup
├── lib/                     # Utility functions and logic
│   ├── adminAccess.js       # Permission checks and admin logic
│   ├── imageRenderer.js     # Helper for processing and displaying images
│   └── storage.js           # Logic for LocalStorage or Cloud storage
├── App.jsx                  # Root component (routing and global state)
└── index.css                # Global styles and Tailwind CSS imports

## License

MIT
