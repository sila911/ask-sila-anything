# Ask Sila Anything - React Version

A beautiful, modern anonymous question form built with React, Vite, and Tailwind CSS. Messages are sent directly to Telegram.

## Features

- 🎨 Beautiful glassmorphism UI with animated gradient background
- 🌓 Dark/Light mode toggle with localStorage persistence
- 🎲 Random question suggestions
- 📤 Secure Telegram delivery through backend API
- ⚡ Built with React and Vite for optimal performance
- 📱 Fully responsive design
- 🔒 Anonymous submissions

## Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

`npm run dev` now starts both backend API and Vite frontend together.

If you need frontend only:

```bash
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` folder.

### Deploy on Vercel

This project includes a Vercel serverless API endpoint at `/api/telegram/send`.

In your Vercel project settings, add these environment variables:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

After deployment, the frontend will call the same-origin API route automatically.

### Preview Production Build

```bash
npm run preview
```

## Configuration

Create a `.env` file in project root:

```bash
PORT=3001
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

You can copy from `.env.example`.

## Project Structure

```
.
├── api/                     # Vercel serverless API routes
│   ├── health.js            # Health check endpoint
│   └── telegram/            # Telegram-related API handlers
│       └── send.js          # POST /api/telegram/send handler
├── img/                     # Source image assets
│   └── sila2.jpg            # Profile image source copy
├── public/                  # Static public files served as-is
│   ├── favicon.svg          # Browser tab icon
│   └── sila2.jpg            # Public profile image used by UI
├── server/                  # Local Express backend for development
│   ├── index.js             # Express server entry and routes
│   └── lib/                 # Shared backend utilities
│       └── telegram.js      # Telegram delivery service logic
├── src/                     # React frontend source code
│   ├── components/          # Reusable UI components
│   │   ├── Footer.jsx       # Footer and social links
│   │   ├── Header.jsx       # Top header and theme controls
│   │   ├── Profile.jsx      # Profile card section
│   │   ├── QuestionForm.jsx # Main question submit form
│   │   └── ThankYouModal.jsx # Success modal after submit
│   ├── App.jsx              # Root app component
│   ├── index.css            # Main global styles
│   ├── input.css            # Tailwind CSS input source
│   ├── main.jsx             # React app bootstrap file
│   └── output.css           # Generated Tailwind CSS output
├── .env.example             # Sample environment variable template
├── .gitignore               # Git ignore rules
├── index.html               # Vite HTML entry template
├── package.json             # Scripts and dependencies
├── postcss.config.js        # PostCSS configuration
├── README.md                # Project documentation
├── tailwind.config.js       # Tailwind configuration
└── vite.config.js           # Vite dev/build configuration
```

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Icons** - Icons
- **Express + dotenv** - Secure backend endpoint and env management
- **Telegram Bot API** - Message delivery

## License

MIT
