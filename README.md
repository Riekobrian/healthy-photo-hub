# Healthy Photo Hub

## Project Overview

A React-based photo management application built with TypeScript, Vite, and modern web technologies.

## Technologies

- Vite + React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Jest + Testing Library
- MSW (Mock Service Worker)

## Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm 9+ or Bun

## Local Development Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd healthy-photo-hub
```

2. Install dependencies:

```bash
npm install
# or with Bun
bun install
```

3. Create a `.env` file in the root directory:

```env
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. Start the development server:

```bash
npm run dev
# or with Bun
bun dev
```

The app will be available at http://localhost:8080

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Testing

The project uses Jest and Testing Library for testing. Mock Service Worker (MSW) is used to intercept and mock API requests during tests.

Run tests:

```bash
npm test
```

Generate coverage report:

```bash
npm run coverage
```

## Error Handling and Monitoring

The application implements a comprehensive error handling system:

- **Error Logging Service**: Centralized error logging with severity levels (INFO, WARNING, ERROR, CRITICAL)
- **Toast Notifications**: User-friendly error messages using Sonner
- **Console Logging**: Detailed error information for development
- **Error Context**: Structured error logging with additional context
- **Error Rotation**: Maintains last 100 errors in memory
- **External Service Integration**: Prepared for integration with services like Sentry (TODO)

## Deployment

### Production Build

1. Build the application:

```bash
npm run build
```

2. Preview the build:

```bash
npm run preview
```

### Deployment Options

#### Netlify (Recommended)

1. Push your changes to your repository
2. Open [Lovable](https://lovable.dev/projects/839b1640-94c9-4990-a115-94799dc449c5)
3. Click Share -> Publish

#### Custom Domain Setup

1. Navigate to Project > Settings > Domains
2. Click Connect Domain
3. Follow the [custom domain setup guide](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Environment Variables

Required environment variables:

- `VITE_GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `VITE_GOOGLE_CLIENT_SECRET`: Google OAuth client secret

For local development, create a `.env` file. For production, set these through your hosting platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is private and confidential.
