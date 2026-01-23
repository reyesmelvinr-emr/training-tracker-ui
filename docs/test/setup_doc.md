# Test Setup Configuration Documentation

## Setup Overview

**File:** `src/test/setup.ts`  
**Type:** Test Configuration  
**Team:** Frontend Team / QA Team  
**Last Updated:** January 24, 2026

### Purpose
Initializes testing environment for the Training Tracker UI project. Configures testing libraries, assertions, and DOM utilities needed for unit, integration, and component testing. Acts as the entry point for all test-related setup in the Vitest/Jest ecosystem.

### Key Features
- Jest-DOM matchers registration
- Testing Library assertions extended
- DOM testing utilities available globally
- Vitest configuration integration
- React Testing Library support
- Custom assertion methods

---

## Setup File Contents

### Current Configuration

```typescript
import '@testing-library/jest-dom';
```

**What This Does:**
- Imports jest-dom matchers and assertions
- Extends Jest/Vitest with DOM-specific matchers
- Makes custom assertions available in all test files
- Initializes testing environment

---

## Testing Libraries Setup

### Installed Testing Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `@testing-library/react` | latest | React component testing utilities |
| `@testing-library/jest-dom` | latest | Custom DOM matchers |
| `@testing-library/user-event` | latest | User interaction simulation |
| `vitest` | latest | Test runner (Vite-native) |
| `jsdom` | latest | DOM implementation for Node.js |

### jest-dom Matchers Available

Once setup is configured, these matchers become available:

```typescript
// Element presence
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toBeEnabled();
expect(element).toBeEmptyDOMElement();

// Class/Attribute checks
expect(element).toHaveClass('active');
expect(element).toHaveAttribute('href', '/path');
expect(element).toHaveTextContent('Hello');

// Value/Style checks
expect(input).toHaveValue('text');
expect(element).toHaveStyle('color: red');
expect(element).toHaveProperty('id', 'my-id');

// Focus state
expect(element).toHaveFocus();
expect(element).not.toHaveFocus();

// Form validation
expect(input).toBeRequired();
expect(select).toHaveFormValues({ name: 'John' });
```

---

## Vitest Configuration

### vitest.config.ts Integration

The `setup.ts` file works with Vitest configuration:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'], // ← Loads setup.ts
    css: true
  }
});
```

**Configuration Details:**
- `environment: 'jsdom'` - Uses DOM in Node.js environment
- `setupFiles: ['./src/test/setup.ts']` - Runs setup before each test
- `globals: true` - Makes describe, it, etc. globally available
- `css: true` - Processes CSS imports

---

## Running Tests

### NPM Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Basic Test Execution

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## Test File Structure

### Example Test File

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button Component', () => {
  it('should render button', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  it('should be enabled by default', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeEnabled();
  });
  
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('should handle click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

---

## Jest Configuration

### jest.config.js (If Using Jest Instead of Vitest)

```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

---

## Writing Tests

### Example 1: Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click');
  });
});
```

---

### Example 2: Hook Test
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

describe('useCounter Hook', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

---

### Example 3: User Interaction Test
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/LoginForm';

describe('LoginForm', () => {
  it('should submit form with valid data', async () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    expect(screen.getByText('Login successful')).toBeInTheDocument();
  });
});
```

---

### Example 4: API Mock Test
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { CourseList } from '@/components/CourseList';
import { vi } from 'vitest';

describe('CourseList with API', () => {
  it('should display courses after loading', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          items: [
            { id: '1', title: 'Course 1' }
          ]
        })
      })
    );
    
    render(<CourseList />);
    
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
    });
  });
});
```

---

### Example 5: Context Test
```typescript
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

describe('AuthContext', () => {
  function TestComponent() {
    const { user } = useAuth();
    return <div>{user?.email}</div>;
  }
  
  it('should provide user context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByText('demo@company.com')).toBeInTheDocument();
  });
});
```

---

### Example 6: Form Validation Test
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { validators } from '@/utils/validators';

describe('Email Validation', () => {
  it('should validate correct emails', () => {
    expect(validators.isValidEmail('user@example.com')).toBe(true);
    expect(validators.isValidEmail('invalid')).toBe(false);
  });
  
  it('should extract domain correctly', () => {
    const domain = validators.extractDomain('user@example.com');
    expect(domain).toBe('example.com');
  });
});
```

---

### Example 7: Integration Test
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';

describe('App Integration', () => {
  it('should complete user flow', async () => {
    render(<App />);
    
    // Navigate to login
    const loginLink = screen.getByRole('link', { name: /login/i });
    await userEvent.click(loginLink);
    
    // Fill and submit login form
    const emailInput = screen.getByLabelText('Email');
    await userEvent.type(emailInput, 'user@example.com');
    
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });
});
```

---

### Example 8: Accessibility Test
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button Accessibility', () => {
  it('should have accessible button role', () => {
    render(<Button>Submit</Button>);
    
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toBeInTheDocument();
  });
  
  it('should announce loading state', () => {
    render(<Button loading>Loading...</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
```

---

### Example 9: Snapshot Test
```typescript
import { render } from '@testing-library/react';
import { CourseCard } from '@/components/CourseCard';

describe('CourseCard Snapshot', () => {
  it('should match snapshot', () => {
    const { container } = render(
      <CourseCard
        title="Course 1"
        required={true}
        active={true}
      />
    );
    
    expect(container).toMatchSnapshot();
  });
});
```

---

### Example 10: Performance Test
```typescript
import { render, screen } from '@testing-library/react';
import { LargeCourseList } from '@/components/LargeCourseList';

describe('Performance', () => {
  it('should render large list efficiently', () => {
    const courses = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      title: `Course ${i}`
    }));
    
    const start = performance.now();
    render(<LargeCourseList courses={courses} />);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(1000); // Should render in < 1s
  });
});
```

---

## Coverage Configuration

### Generate Coverage Report

```bash
npm run test:coverage
```

### Coverage Configuration (vitest.config.ts)

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts'
      ]
    }
  }
});
```

### Coverage Thresholds

```typescript
{
  "test": {
    "coverage": {
      "lines": 80,
      "functions": 80,
      "branches": 75,
      "statements": 80
    }
  }
}
```

---

## Mock Setup

### Mocking Modules

```typescript
import { vi } from 'vitest';

// Mock entire module
vi.mock('@/utils/api', () => ({
  fetchCourses: vi.fn(() => Promise.resolve([]))
}));

// Mock specific function
vi.mocked(fetchCourses).mockResolvedValue([
  { id: '1', title: 'Course 1' }
]);
```

---

### Mocking Browser APIs

```typescript
// Mock localStorage
const localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorage
});

// Mock fetch
global.fetch = vi.fn();
```

---

## Best Practices

### ✅ Good Test Practices

1. **Test User Behavior**
```typescript
// Good - Tests what user sees/does
await userEvent.click(screen.getByRole('button'));

// Bad - Tests implementation details
expect(component.state.isClicked).toBe(true);
```

2. **Use Semantic Queries**
```typescript
// Good - User sees role/label
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Email');

// Bad - Implementation-dependent
component.querySelector('.btn');
component.find('[data-testid="button"]');
```

3. **Arrange-Act-Assert Pattern**
```typescript
// Good - Clear structure
// Arrange
const mockFn = vi.fn();
// Act
await userEvent.click(button);
// Assert
expect(mockFn).toHaveBeenCalled();
```

4. **Test Isolation**
```typescript
// Good - Each test is independent
beforeEach(() => {
  vi.clearAllMocks();
});

it('test 1', () => {
  // Independent test
});
```

---

## Debugging Tests

### Debug Helper

```typescript
import { render, screen, debug } from '@testing-library/react';

it('should render', () => {
  const { debug } = render(<Component />);
  debug(); // Prints HTML to console
});
```

### Using console.log

```typescript
it('should debug', () => {
  const button = screen.getByRole('button');
  console.log(button.outerHTML);
  console.log(button.textContent);
});
```

### VS Code Debugging

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:watch"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

---

## Common Test Scenarios

### Test 1: Empty State
```typescript
it('should show empty state', async () => {
  vi.mocked(fetchCourses).mockResolvedValue([]);
  
  render(<CourseList />);
  
  await waitFor(() => {
    expect(screen.getByText('No courses')).toBeInTheDocument();
  });
});
```

---

### Test 2: Loading State
```typescript
it('should show loading state', () => {
  render(<CourseList isLoading={true} />);
  
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});
```

---

### Test 3: Error Handling
```typescript
it('should display error', async () => {
  vi.mocked(fetchCourses).mockRejectedValue(new Error('API Error'));
  
  render(<CourseList />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

---

### Test 4: Form Submission
```typescript
it('should submit form', async () => {
  const onSubmit = vi.fn();
  render(<CourseForm onSubmit={onSubmit} />);
  
  await userEvent.type(screen.getByLabelText('Title'), 'New Course');
  await userEvent.click(screen.getByRole('button', { name: /save/i }));
  
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'New Course' })
  );
});
```

---

## Related Documentation

- [validators.ts Documentation](../utils/validators_doc.md) - Unit testing validators
- [Button Component Documentation](../components/Button_doc.md) - Component testing
- [AuthContext Documentation](../context/AuthContext_doc.md) - Context testing
- [CI/CD Pipeline Documentation](#) - Automated testing

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `vitest` | latest | Test runner |
| `@testing-library/react` | latest | React testing utilities |
| `@testing-library/jest-dom` | latest | DOM matchers |
| `@testing-library/user-event` | latest | User interaction |
| `jsdom` | latest | DOM implementation |
| `@vitest/ui` | latest | UI for test results |
| `@vitest/coverage-v8` | latest | Coverage reporting |

---

## Test Organization

### Directory Structure
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.tsx
├── utils/
│   ├── validators.ts
│   └── __tests__/
│       └── validators.test.ts
└── test/
    └── setup.ts ← ← This file
```

---

## Common Pitfalls

### ❌ Pitfall 1: Testing Implementation Details
```typescript
// DON'T DO THIS
expect(component.state.isLoaded).toBe(true);

// DO THIS - Test visible behavior
expect(screen.getByText('Data')).toBeInTheDocument();
```

---

### ❌ Pitfall 2: Not Waiting for Async Operations
```typescript
// DON'T DO THIS
render(<AsyncComponent />);
expect(screen.getByText('Loaded')).toBeInTheDocument(); // Might fail

// DO THIS - Wait for async
render(<AsyncComponent />);
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

---

### ❌ Pitfall 3: Overly Specific Selectors
```typescript
// DON'T DO THIS
screen.getByTestId('course-list-item-1-title-span');

// DO THIS - Use semantic queries
screen.getByRole('heading', { name: /course title/i });
```

---

## Metadata

| Property | Value |
|----------|-------|
| **File Size** | ~5 lines |
| **Complexity** | Low |
| **External Dependencies** | @testing-library/jest-dom |
| **Last Reviewed** | January 24, 2026 |
| **Status** | Active - Configuration |

---

## Future Enhancements

1. E2E test configuration (Playwright/Cypress)
2. Visual regression testing
3. Performance benchmarking setup
4. API mock server (MSW) integration
5. Accessibility testing automation (axe)

---

*Documentation generated for AKR documentation system. See related files for complete testing documentation.*
