# Ask Sila Story Studio

A full-stack application where users submit questions and admins create styled answer images for social media stories.

## Architecture & Features

The project has been migrated from a frontend-only `localStorage` app to a robust **Full-Stack** architecture with a Laravel backend and MySQL database.

### User Flow
- **Submit Questions**: Users can ask anything through a simple, sleek interface.
- **Recently Asked**: A public list of recent questions. 
- **Auto-Answers**: Once an admin replies, the answer is displayed directly under the question in the public list.
- **Relative Timing**: Question timestamps show as "just now", "5 mins ago", etc.

### Admin Flow
- **Secured Access**: Admin login is hidden behind the `Sila` footer trigger and secured by **Laravel Sanctum**.
- **Answer Creator**: Admins select a user question, write an answer, and can style a beautiful image for Instagram/Facebook stories.
- **Persistent Storage**: All questions and designs are stored in a MySQL database.
- **Telegram Notifications**: Real-time notifications sent to a Telegram bot whenever a new user question is received.

### Story Generator
- Renders question (top) and answer (bottom) in one high-quality image.
- Supports instant **Copy to Clipboard** (browser permitting) or **Download**.
- Quick-open links to Instagram and Facebook story creation pages.

## Tech Stack

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS**
- **React Icons**

### Backend
- **Laravel 12** (PHP 8.2+)
- **MySQL**
- **Laravel Sanctum** (API Authentication)
- **Telegram Bot API** (Notifications)

## Project Structure

```text
/backend          # Laravel application
/frontend         # Vite + React application
setup.sql         # Database schema for manual setup
```

## Setup & Installation

### Backend Setup (Laravel)

1.  Navigate to `backend/`.
2.  Install dependencies:
    ```bash
    composer install
    ```
3.  Configure environment:
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
4.  Configure your database in `.env` (DB_DATABASE, DB_USERNAME, etc.).
5.  (Optional) Set your Telegram Bot credentials:
    ```text
    TELEGRAM_BOT_TOKEN=your_token
    TELEGRAM_CHAT_ID=your_chat_id
    ```
6.  Run migrations:
    ```bash
    php artisan migrate
    ```
7.  Start the server:
    ```bash
    php artisan serve
    ```

### Frontend Setup (Vite)

1.  Navigate to `frontend/`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start development server:
    ```bash
    npm run dev
    ```

The frontend is configured to proxy `/api` requests to `http://127.0.0.1:8000`.

## Admin Access

1. Open the app and click `Sila` in the footer.
2. Login with your admin credentials (default user is created via migrations/seeders).
3. Workspace includes:
   - `Create`: Answer generator and persistent reply tool.
   - `Library`: Gallery of saved answers.
   - `Admin`: Analytics dashboard for metrics (questions, views, shares).

## License

MIT
