# Developer Guide

## 🏗 Architecture Overview

The Figma-React Converter is built with modern web technologies and follows best practices for scalability and maintainability.

### Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **AI**: OpenAI GPT-4, Custom AI services
- **Testing**: Vitest, React Testing Library
- **Build**: Vite, ESBuild
- **Deployment**: Vercel

### Project Structure

\`\`\`
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── advanced-ux/      # Advanced UX features
│   └── monitoring/       # Analytics components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── services/             # API and business logic
├── __tests__/            # Test files
└── docs/                 # Documentation
\`\`\`

## 🔧 Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/your-org/figma-react-converter.git
cd figma-react-converter

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
\`\`\`

### Environment Variables

\`\`\`bash
# Required
OPENAI_API_KEY=your_openai_api_key
FIGMA_ACCESS_TOKEN=your_figma_token

# Optional
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
ANALYTICS_API_KEY=your_analytics_key
\`\`\`

## 🧪 Testing

### Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
\`\`\`

### Test Structure

\`\`\`typescript
// Example component test
import { render, screen } from '@testing-library/react'
import { ExportPanel } from '@/components/export-panel'

describe('ExportPanel', () => {
  it('renders export options', () => {
    render(<ExportPanel exportData={mockData} />)
    expect(screen.getByText('Export Options')).toBeInTheDocument()
  })
})
\`\`\`

### Testing Guidelines

1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user workflows
4. **Mock External APIs**: Use MSW for API mocking

## 🏛 Core Services

### Figma API Service

\`\`\`typescript
// services/figma-api-service.ts
export class FigmaApiService {
  async getFile(fileKey: string): Promise<FigmaFile> {
    // Implementation
  }
  
  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<FigmaNodes> {
    // Implementation
  }
}
\`\`\`

### AI Code Generator

\`\`\`typescript
// services/ai-code-generator.ts
export class AICodeGenerator {
  async generateComponent(design: ParsedFigmaDesign): Promise<GeneratedCode> {
    // Implementation
  }
}
\`\`\`

### Export Service

\`\`\`typescript
// services/export-service.ts
export class ExportService {
  async createZipDownload(data: ExportData): Promise<void> {
    // Implementation
  }
  
  async pushToGitHub(data: ExportData, token: string): Promise<string> {
    // Implementation
  }
}
\`\`\`

## 🎨 Component Development

### Component Guidelines

1. **TypeScript First**: All components use TypeScript
2. **Props Interface**: Define clear prop interfaces
3. **Default Props**: Provide sensible defaults
4. **Error Boundaries**: Handle errors gracefully

### Example Component

\`\`\`typescript
interface MyComponentProps {
  title: string
  description?: string
  onAction?: () => void
  className?: string
}

export function MyComponent({ 
  title, 
  description, 
  onAction, 
  className = "" 
}: MyComponentProps) {
  return (
    <div className={`my-component ${className}`}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {onAction && (
        <button onClick={onAction}>
          Take Action
        </button>
      )}
    </div>
  )
}
\`\`\`

### Styling Conventions

1. **Tailwind Classes**: Use Tailwind for styling
2. **Component Variants**: Use class-variance-authority
3. **Responsive Design**: Mobile-first approach
4. **Dark Mode**: Support dark mode where applicable

## 🔒 Security

### Input Validation

\`\`\`typescript
import { z } from 'zod'

const FigmaUrlSchema = z.string().url().refine(
  (url) => url.includes('figma.com'),
  'Must be a valid Figma URL'
)

export function validateFigmaUrl(url: string) {
  return FigmaUrlSchema.parse(url)
}
\`\`\`

### Rate Limiting

\`\`\`typescript
export class RateLimiter {
  private requests = new Map<string, number[]>()
  
  isAllowed(key: string, limit = 10, windowMs = 60000): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // Remove old requests
    const validRequests = requests.filter(time => now - time < windowMs)
    
    if (validRequests.length >= limit) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(key, validRequests)
    return true
  }
}
\`\`\`

### Token Management

\`\`\`typescript
export class SecureStorage {
  private static encrypt(data: string): string {
    // Encryption implementation
  }
  
  private static decrypt(data: string): string {
    // Decryption implementation
  }
  
  static setToken(key: string, token: string): void {
    const encrypted = this.encrypt(token)
    localStorage.setItem(key, encrypted)
  }
  
  static getToken(key: string): string | null {
    const encrypted = localStorage.getItem(key)
    return encrypted ? this.decrypt(encrypted) : null
  }
}
\`\`\`

## 📊 Performance

### Monitoring

\`\`\`typescript
export class PerformanceMonitor {
  static startTimer(operation: string): () => void {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      console.log(`${operation}: ${duration.toFixed(2)}ms`)
    }
  }
}

// Usage
const endTimer = PerformanceMonitor.startTimer('figma-fetch')
await fetchFigmaFile(url)
endTimer()
\`\`\`

### Caching

\`\`\`typescript
class Cache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>()
  
  set(key: string, data: T, ttlMs = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
}
\`\`\`

### Code Splitting

\`\`\`typescript
// Lazy load heavy components
const AdvancedEditor = lazy(() => import('./advanced-editor'))
const AnalyticsDashboard = lazy(() => import('./analytics-dashboard'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/editor" element={<AdvancedEditor />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
      </Routes>
    </Suspense>
  )
}
\`\`\`

## 🚀 Deployment

### Build Process

\`\`\`bash
# Build for production
npm run build

# Test production build locally
npm run start

# Run linting
npm run lint

# Type checking
npm run type-check
\`\`\`

### Environment Configuration

\`\`\`typescript
// lib/config.ts
export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: process.env.OPENAI_MODEL || 'gpt-4',
  },
  figma: {
    accessToken: process.env.FIGMA_ACCESS_TOKEN!,
    apiUrl: 'https://api.figma.com/v1',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
}
\`\`\`

### Vercel Deployment

\`\`\`json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "OPENAI_API_KEY": "@openai-api-key",
    "FIGMA_ACCESS_TOKEN": "@figma-access-token"
  }
}
\`\`\`

## 🔧 API Reference

### Figma API Integration

\`\`\`typescript
interface FigmaFile {
  name: string
  lastModified: string
  thumbnailUrl: string
  document: FigmaNode
}

interface FigmaNode {
  id: string
  name: string
  type: string
  children?: FigmaNode[]
  absoluteBoundingBox?: Rectangle
  fills?: Paint[]
  strokes?: Paint[]
}
\`\`\`

### AI Service API

\`\`\`typescript
interface AIGenerationRequest {
  design: ParsedFigmaDesign
  preferences: {
    framework: 'react' | 'vue' | 'angular'
    styling: 'css' | 'tailwind' | 'styled-components'
    typescript: boolean
  }
}

interface AIGenerationResponse {
  components: GeneratedComponent[]
  styles: GeneratedStyles[]
  quality: QualityMetrics
}
\`\`\`

## 🐛 Debugging

### Common Issues

1. **CORS Errors**: Configure proxy in development
2. **API Rate Limits**: Implement proper rate limiting
3. **Memory Leaks**: Clean up event listeners and timers
4. **Bundle Size**: Use dynamic imports for large dependencies

### Debug Tools

\`\`\`typescript
// Debug utility
export const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data)
    }
  },
  
  time: (label: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.time(label)
    }
  },
  
  timeEnd: (label: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(label)
    }
  }
}
\`\`\`

## 📈 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Add** tests for new functionality
5. **Run** the test suite
6. **Submit** a pull request

### Code Standards

- **ESLint**: Follow the configured rules
- **Prettier**: Format code consistently
- **TypeScript**: Use strict type checking
- **Tests**: Maintain >80% coverage

### Pull Request Template

\`\`\`markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
\`\`\`

---

For more information, see the [API Documentation](./api-reference.md) and [Deployment Guide](./deployment.md).
\`\`\`
