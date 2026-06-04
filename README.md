# Ask Sila Story Studio

A full-stack application where users submit questions and admins create styled answer images for social media stories.

## Architecture & Features

The project is built with a **React frontend** and uses **Supabase** for a robust, real-time backend-as-a-service (BaaS) architecture.

### User Flow
- **Submit Questions**: Users can ask anything through a simple, sleek interface.
- **Curiosity Lock**: The public list of recent questions is blurred and locked until the user asks their own question.
- **Recently Asked**: A public list of recent questions with real-time updates and sorting/filtering options. 
- **Auto-Answers**: Once an admin replies, the answer is displayed directly under the question in the public list.
- **Engagement**: Users can like, comment, and share questions they find interesting.

### Admin Flow
- **Secured Access**: Admin login is hidden behind the `Sila` footer trigger and secured by **Supabase Auth**.
- **Answer Creator**: Admins select a user question, write an answer, and can style a beautiful image for Instagram/Facebook stories.
- **Persistent Storage**: All questions, events, and designs are stored in **Supabase Database**.

### UI & UX
- **Default Dark Mode**: The application defaults to a sleek dark mode theme optimized for readability, with a glassmorphism light mode alternative.
- **Modern Profile Card**: Features a beautiful cover banner and an overlapping profile avatar for a professional look.
- **Optimized for Mobile**: Responsive layout with minimized margins and optimized font sizes for better readability on phone devices.
- **Glassmorphism Design**: Sleek, modern UI with frosted glass effects and smooth transitions.

### Story Generator
- Renders question (top) and answer (bottom) in one high-quality image.
- Supports instant **Copy to Clipboard** (browser permitting) or **Download**.
- Quick-open links to Instagram and Facebook story creation pages.

## Tech Stack

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS**
- **React Icons**

### Backend (BaaS)
- **Supabase** (Authentication, Database, Real-time)
- **PostgreSQL** (Managed by Supabase)

## Project Structure

```text
/frontend         # Vite + React application
/backend          # (Legacy) Laravel application
supabase_setup.sql # Database schema and RLS policies for Supabase
```

## Setup & Installation

### Supabase Setup

1. Create a new project on [Supabase](https://supabase.com/).
2. Run the SQL in `supabase_setup.sql` in your Supabase SQL Editor to set up tables and Row Level Security (RLS) policies.
3. Obtain your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the project settings.

### Frontend Setup (Vite)

1.  Navigate to `frontend/`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment:
    Create a `.env` file in `frontend/` with:
    ```text
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  Start development server:
    ```bash
    npm run dev
    ```

## Admin Access

1. Open the app and click `Sila` in the footer.
2. If it's your first time, you'll be prompted to set up an admin password.
3. Workspace includes:
   - `Create`: Answer generator and persistent reply tool.
   - `Library`: Gallery of saved answers.
   - `Admin`: Analytics dashboard for metrics (questions, views, shares).

## License

MIT
