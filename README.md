# Healthy Photo Hub

## Project Overview

Healthy Photo Hub is a comprehensive React-based healthcare photo management system that allows users to securely store, organize and manage medical images and health-related documents. Built with modern web technologies, it provides a robust platform for healthcare professionals and patients to maintain digital health records with an intuitive user interface.

## Key Features

### User Management

- Secure authentication using Netlify Identity
- OAuth integration with Google and GitHub
- User profiles with detailed information (name, email, phone, location)
- Company and professional details display
- Profile avatar with fallback to user initials

### Album Management

- Create and view health record albums
- Organize photos by categories or medical events
- Album previews with photo counts
- User-specific album collections
- Responsive grid layout for album browsing

### Photo Management

- High-quality medical image storage
- Thumbnail generation for quick previews
- Photo title editing capabilities
- Image metadata management
- Full-screen photo viewing
- Efficient photo navigation within albums

### Search and Navigation

- Real-time user search functionality
- Filter users by name, email, or username
- Breadcrumb navigation for easy browsing
- Quick access to recent items
- Responsive mobile-friendly interface

### User Interface

- Modern, clean design using Tailwind CSS
- Responsive layout for all screen sizes
- Loading states with skeleton placeholders
- Toast notifications for user feedback
- Error boundaries for graceful error handling
- Dark mode support (via next-themes)

### Security

- Protected routes for authenticated users
- Secure OAuth implementations
- Environment variable protection
- XSS protection headers
- Strict content security policy

### Error Handling

- Comprehensive error logging system
- Multiple severity levels (INFO, WARNING, ERROR, CRITICAL)
- Detailed error context capture
- User-friendly error messages
- Automatic error recovery
- Last 100 errors retention

### Performance

- Lazy loading of images
- Code splitting and dynamic imports
- Optimized bundle size
- Caching strategies
- Efficient data fetching with React Query

### Technical Features

- TypeScript for type safety
- React Query for efficient data fetching
- Component-based architecture
- Custom hooks for business logic
- Comprehensive test coverage
- MSW for API mocking
- Vite for fast development
- Jest and Testing Library for testing

## API Integration

The application integrates with a RESTful API providing:

- User management endpoints
- Album CRUD operations
- Photo management endpoints
- Search and filtering capabilities

## Tools and Utilities

### Development Tools

- Vite dev server with HMR
- TypeScript compilation
- ESLint for code quality
- Prettier for code formatting
- Jest for testing
- MSW for API mocking

### Monitoring and Debugging

- Error logging service
- Performance monitoring
- Development debugging tools
- Test coverage reports

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
2. Open [Netlify](https://savannahinformatics.netlify.app)
3. Click Share -> Publish

#### Custom Domain Setup

1. Navigate to Project > Settings > Domains
2. Click Connect Domain
3. Follow the [custom domain setup guide]

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
