# Test Ease

A modern Next.js application built with TypeScript, Supabase, React Query, and Tailwind CSS.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Supabase** - Backend as a Service (Database, Auth, Storage)
- **React Query (TanStack Query)** - Data fetching and state management
- **Tailwind CSS** - Utility-first CSS framework
- **Yarn** - Package manager

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Start the development server:

   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout with providers
│   └── page.tsx         # Home page
├── components/          # React components
│   └── providers.tsx    # React Query provider
├── hooks/               # Custom React hooks
│   └── index.ts         # Authentication and data hooks
├── lib/                 # Utility libraries
│   ├── supabase.ts      # Supabase client configuration
│   └── utils.ts         # Utility functions
├── queries/             # React Query queries and mutations
│   └── index.ts         # Data fetching logic
└── types/               # TypeScript type definitions
    └── index.ts         # Common types
```

## Features

- ✅ Next.js 15 with App Router
- ✅ TypeScript configuration
- ✅ Supabase client setup
- ✅ React Query integration
- ✅ Tailwind CSS styling
- ✅ Authentication hooks
- ✅ Data fetching patterns
- ✅ Development tools (React Query DevTools)

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## Next Steps

1. Set up your Supabase project and add the environment variables
2. Create your database tables
3. Implement authentication flows
4. Build your application features
5. Deploy to Vercel or your preferred platform

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

/// FOR PRODUCTION
curl -X POST "https://api.telegram.org/bot8399156152:AAEZCvknDgJ8RLH6LQXTTlOL0Nw75efj6dQ/setWebhook" \
 -d "url=https://test-ease-new.vercel.app/api/telegram/webhook"

/// FOR LOCAL
curl -X POST "https://api.telegram.org/bot8399156152:AAEZCvknDgJ8RLH6LQXTTlOL0Nw75efj6dQ/setWebhook" \
 -d "url=https://velvet-rockered-unradically.ngrok-free.dev/api/telegram/webhook"
