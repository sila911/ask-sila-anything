# Ask Sila Anything - React Version

A beautiful, modern anonymous question form built with React, Vite, and Tailwind CSS. Messages are sent directly to Telegram.

## Features

- 🎨 Beautiful glassmorphism UI with animated gradient background
- 🌓 Dark/Light mode toggle with localStorage persistence
- 🎲 Random question suggestions
- 📤 Direct Telegram bot integration
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

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Configuration

Edit the Telegram credentials in `src/components/QuestionForm.jsx`:

```javascript
const BOT_TOKEN = 'your_bot_token'
const CHAT_ID = 'your_chat_id'
```

## Project Structure

```
src/
├── components/
│   ├── Header.jsx        # Theme toggle and AMA branding
│   ├── Profile.jsx       # Profile section with image and bio
│   ├── QuestionForm.jsx  # Main form with shuffle and submit
│   ├── Footer.jsx        # Social links footer
│   └── ThankYouModal.jsx # Success message modal
├── App.jsx               # Main app component
├── main.jsx              # React entry point
└── index.css             # Global styles with Tailwind
```

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Font Awesome** - Icons
- **Telegram Bot API** - Message delivery

## License

MIT
