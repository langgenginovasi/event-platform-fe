# Event Platform - Frontend (FE)

Welcome to the Frontend for the Event Platform V2! This frontend is built using Next.js 14+ (App Router), Tailwind CSS v4, and Shadcn UI, providing a modern, fast, and highly responsive user interface.

## Prerequisites

Before running the application, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or above recommended)
- The Backend API should be running concurrently to serve data.

## Installation & Setup

1. **Clone the repository** (if you haven't already).
2. **Navigate to the frontend directory**:
   ```bash
   cd event-platform-fe
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Environment Variables**:
   Create a `.env.local` file (or copy from an example if provided) in the root of the `event-platform-fe` directory. You will typically need to configure the Backend API URL and NextAuth secrets. Example:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3000/api"
   NEXTAUTH_URL="http://localhost:3001"
   NEXTAUTH_SECRET="your_nextauth_secret_key"
   ```

## Running the Development Server

To start the Next.js development server:

```bash
npm run dev
```

By default, the frontend will be available at [http://localhost:3000](http://localhost:3000) (if the backend is on `3000`, Next.js will usually fallback to `3001`, or you can start it on a specific port).

Open the URL in your browser to see the application.

## Build for Production

To build the optimized production version of the frontend:

```bash
npm run build
```

After building, you can start the production server with:

```bash
npm run start
```

## Useful Commands

- `npm run lint` - Run ESLint to catch formatting or linting issues.
- `npm run dev` - Start development server.
