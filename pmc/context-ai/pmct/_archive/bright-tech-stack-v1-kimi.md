# Tech Stack Reference Document
## Bright Run Platform - Development Stack

### Core Technologies
```
Frontend Framework: Next.js 14 (App Router)
Language: TypeScript 5.x
Runtime: Node.js 18+
Package Manager: npm/yarn
```

### Database & Backend
```
Database: Supabase (PostgreSQL)
- Always create databases with mock data for production scenarios
- Use Supabase CLI for local development
- Include seed.sql files for mock data generation
```

### State Management
```
Global State: Zustand
- Lightweight state management for React components
- Use for user sessions, app settings, and global UI state
```

### Styling
```
CSS Framework: Tailwind CSS
- Utility-first CSS framework
- Custom configuration in tailwind.config.js
- Include responsive design utilities
```

### Authentication
```
Auth Provider: Supabase Auth
- Built-in authentication with Supabase
- Support for OAuth providers (Google, GitHub, etc.)
- JWT token management
```

### API Layer
```
API Routes: Next.js API Routes
- Serverless functions within Next.js
- RESTful endpoints for external integrations
- Middleware for authentication and validation
```

### Real-time Communication
```
WebSockets: Socket.io
- Real-time bidirectional communication
- Fallback to polling for compatibility
- Use with Next.js API routes
```

### AI/ML Integration
```
Language Models:
- Kimi (Moonshot AI)
- Qwen 32B
- GPT-OSS 120B
- OpenAI API Protocol compatible

Infrastructure: Runpod
- GPU cloud computing for private LLMs
- Serverless GPU deployment
```

### External APIs
```
Integration Layer:
- RESTful API clients
- GraphQL support when needed
- Rate limiting and caching strategies
- API key management through environment variables
```

### Testing
```
Testing Framework: Jest
- Unit testing for utilities and hooks
- React Testing Library for component testing
- Integration tests for API routes
```

### Development Tools
```
Version Control: Git & GitHub
- Feature branch workflow
- Pull request reviews
- Automated CI/CD with GitHub Actions

Deployment: Vercel
- Zero-config deployment for Next.js
- Environment variable management
- Preview deployments for PRs
```

### Environment Setup
```
Required Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY
- RUNPOD_API_KEY
- DATABASE_URL (for local development)
```

### Mock Data Generation
```
Database Seeding Strategy:
1. Create seed.sql files for each table
2. Use Faker.js for realistic mock data
3. Include relationships between tables
4. Generate data for testing scenarios
5. Reset and reseed on development startup
```

### Quick Start Commands
```bash
# Install dependencies
npm install

# Setup Supabase locally
npx supabase init
npx supabase start

# Seed database with mock data
npm run db:seed

# Start development server
npm run dev

# Run tests
npm test
```

### File Structure Template
```
src/
├── app/
│   ├── api/          # Next.js API routes
│   ├── auth/         # Authentication pages
│   └── (main)/       # Main application pages
├── components/       # React components
├── lib/           # Utilities and helpers
├── stores/        # Zustand stores
├── types/         # TypeScript types
├── hooks/         # Custom React hooks
└── __tests__/     # Test files
```

### Database Schema Template
```sql
-- Example table structure with mock data
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Mock data insertion
INSERT INTO users (email) VALUES 
('user1@example.com'),
('user2@example.com'),
('user3@example.com');
```

This document serves as a quick reference for implementing features using the specified tech stack. Always ensure mock data is available for any database-dependent functionality.
        