# validators Utility Documentation

## Utility Overview

**File:** `src/utils/validators.ts`  
**Type:** Utility Functions (Form Validation)  
**Team:** Frontend Team  
**Last Updated:** January 24, 2026

### Purpose
Provides reusable form validation utilities for email validation and domain extraction. Supports email validation using a simple RFC-compatible pattern and email domain extraction for analytics, grouping, and access control purposes.

### Key Features
- Email validation with RFC-ish regex pattern
- Email domain extraction for analysis
- Type-safe TypeScript implementation
- Lightweight with no external dependencies
- Suitable for client-side pre-validation
- Null-safe operations

---

## Functions

### isValidEmail()

#### Function Signature
```typescript
export function isValidEmail(email: string): boolean
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | `string` | Yes | Email address to validate |

#### Return Value

| Return | Type | Description |
|--------|------|-------------|
| Validation result | `boolean` | `true` if email matches pattern, `false` otherwise |

#### Implementation
```typescript
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  // Simple RFC-ish pattern (improvable later)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

#### Regex Pattern Explanation
```
^           - Start of string
[^\s@]+     - One or more characters that are NOT whitespace or @
@           - Literal @ symbol
[^\s@]+     - One or more characters that are NOT whitespace or @
\.          - Literal dot (.)
[^\s@]+     - One or more characters that are NOT whitespace or @
$           - End of string
```

**Pattern Requirements:**
- At least one character before @ (not whitespace)
- Exactly one @ symbol
- At least one character between @ and .
- At least one character after .
- No whitespace anywhere in address

---

### extractDomain()

#### Function Signature
```typescript
export function extractDomain(email: string): string | null
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | `string` | Yes | Email address to extract domain from |

#### Return Value

| Return | Type | Description |
|--------|------|-------------|
| Domain string or null | `string \| null` | Extracted domain in lowercase, or `null` if no @ found |

#### Implementation
```typescript
export function extractDomain(email: string): string | null {
  const at = email.indexOf('@');
  return at === -1 ? null : email.slice(at + 1).toLowerCase();
}
```

#### Extraction Logic
1. Find position of `@` symbol
2. If not found, return `null`
3. Extract everything after `@`
4. Convert to lowercase for consistency
5. Return domain string

---

## Usage Examples

### Example 1: Basic Email Validation in Form
```typescript
import { isValidEmail } from '@/utils/validators';

function validateEmail(email: string): string {
  if (!email) {
    return 'Email is required';
  }
  
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address';
  }
  
  return ''; // No error
}

// Usage
console.log(validateEmail('')); // 'Email is required'
console.log(validateEmail('invalid')); // 'Please enter a valid email address'
console.log(validateEmail('user@example.com')); // '' (valid)
```

---

### Example 2: Login Form Validation
```typescript
import { isValidEmail } from '@/utils/validators';
import React from 'react';

function LoginForm() {
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Real-time validation
    if (!value) {
      setEmailError('Email is required');
    } else if (!isValidEmail(value)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    
    // Submit form
    console.log('Submitting:', email);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
        placeholder="Enter email"
      />
      {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

---

### Example 3: Email Domain Extraction
```typescript
import { extractDomain } from '@/utils/validators';

// Get domain from email
const email = 'john.doe@example.com';
const domain = extractDomain(email);
console.log(domain); // Output: 'example.com'

// Handle invalid email
const invalidEmail = 'no-at-symbol';
const result = extractDomain(invalidEmail);
console.log(result); // Output: null

// Domain always lowercase
const upperEmail = 'USER@EXAMPLE.COM';
const lowerDomain = extractDomain(upperEmail);
console.log(lowerDomain); // Output: 'example.com'
```

---

### Example 4: Domain-Based Access Control
```typescript
import { extractDomain, isValidEmail } from '@/utils/validators';

function isCompanyEmail(email: string): boolean {
  if (!isValidEmail(email)) return false;
  
  const domain = extractDomain(email);
  const allowedDomains = ['company.com', 'corporate.example.com'];
  
  return domain ? allowedDomains.includes(domain) : false;
}

// Usage
console.log(isCompanyEmail('john@company.com')); // true
console.log(isCompanyEmail('jane@corporate.example.com')); // true
console.log(isCompanyEmail('bob@personal.com')); // false
```

---

### Example 5: User Registration Form
```typescript
import { isValidEmail, extractDomain } from '@/utils/validators';
import React from 'react';

interface RegistrationFormState {
  email: string;
  errors: {
    email?: string;
  };
}

function RegistrationForm() {
  const [form, setForm] = React.useState<RegistrationFormState>({
    email: '',
    errors: {}
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof form.errors = {};
    
    // Validate email
    if (!form.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (Object.keys(errors).length > 0) {
      setForm(prev => ({ ...prev, errors }));
      return;
    }
    
    // Extract domain for analytics
    const domain = extractDomain(form.email);
    console.log(`Registering user from domain: ${domain}`);
    
    // Submit to backend
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: form.email,
        domain: domain 
      })
    });
    
    console.log('Registration successful');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={form.email}
        onChange={(e) => setForm(prev => ({
          ...prev,
          email: e.target.value,
          errors: {}
        }))}
        placeholder="Enter email"
      />
      {form.errors.email && (
        <p style={{ color: 'red' }}>{form.errors.email}</p>
      )}
      <button type="submit">Register</button>
    </form>
  );
}
```

---

### Example 6: Email List Validation
```typescript
import { isValidEmail } from '@/utils/validators';

function validateEmailList(emailString: string): { valid: string[], invalid: string[] } {
  const emails = emailString.split('\n').map(e => e.trim()).filter(Boolean);
  
  const valid: string[] = [];
  const invalid: string[] = [];
  
  emails.forEach(email => {
    if (isValidEmail(email)) {
      valid.push(email);
    } else {
      invalid.push(email);
    }
  });
  
  return { valid, invalid };
}

// Usage
const result = validateEmailList(`
  john@example.com
  jane@example.com
  invalid-email
  bob@test.org
`);

console.log(result.valid); // ['john@example.com', 'jane@example.com', 'bob@test.org']
console.log(result.invalid); // ['invalid-email']
```

---

### Example 7: Custom Validation Hook
```typescript
import { isValidEmail } from '@/utils/validators';
import React from 'react';

function useEmailValidation() {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  
  const validate = React.useCallback((value: string) => {
    if (!value) {
      return 'Email is required';
    }
    if (!isValidEmail(value)) {
      return 'Invalid email format';
    }
    return '';
  }, []);
  
  const handleChange = (value: string) => {
    setEmail(value);
    setTouched(true);
    setError(validate(value));
  };
  
  const handleBlur = () => {
    setTouched(true);
    setError(validate(email));
  };
  
  const isValid = !error && email.length > 0;
  
  return {
    email,
    setEmail: handleChange,
    error: touched ? error : '',
    onBlur: handleBlur,
    isValid
  };
}

// Usage in component
function MyForm() {
  const emailField = useEmailValidation();
  
  return (
    <input
      type="email"
      value={emailField.email}
      onChange={(e) => emailField.setEmail(e.target.value)}
      onBlur={emailField.onBlur}
    />
  );
}
```

---

### Example 8: API Endpoint Email Pre-validation
```typescript
import { isValidEmail } from '@/utils/validators';

async function submitUserInvitation(email: string): Promise<boolean> {
  // Client-side validation first
  if (!isValidEmail(email)) {
    console.error('Invalid email format');
    return false;
  }
  
  try {
    const response = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send invitation:', error);
    return false;
  }
}
```

---

### Example 9: Bulk User Import Validation
```typescript
import { isValidEmail, extractDomain } from '@/utils/validators';

interface BulkImportResult {
  valid: Array<{ email: string; domain: string }>;
  invalid: Array<{ email: string; reason: string }>;
}

function validateBulkUserImport(csvData: string[][]): BulkImportResult {
  const valid: BulkImportResult['valid'] = [];
  const invalid: BulkImportResult['invalid'] = [];
  
  csvData.forEach((row, index) => {
    const email = row[0]?.trim();
    
    if (!email) {
      invalid.push({
        email: '',
        reason: `Row ${index + 1}: Email is empty`
      });
      return;
    }
    
    if (!isValidEmail(email)) {
      invalid.push({
        email,
        reason: `Row ${index + 1}: Invalid email format`
      });
      return;
    }
    
    const domain = extractDomain(email);
    if (!domain) {
      invalid.push({
        email,
        reason: `Row ${index + 1}: Could not extract domain`
      });
      return;
    }
    
    valid.push({ email, domain });
  });
  
  return { valid, invalid };
}
```

---

### Example 10: Email Verification Workflow
```typescript
import { isValidEmail } from '@/utils/validators';

async function sendVerificationEmail(email: string): Promise<string> {
  // Step 1: Validate email format
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  // Step 2: Check if email already exists
  const existsResponse = await fetch(`/api/users/check-email?email=${email}`);
  if (!existsResponse.ok) {
    throw new Error('Email already registered');
  }
  
  // Step 3: Send verification email
  const sendResponse = await fetch('/api/verification/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  if (!sendResponse.ok) {
    throw new Error('Failed to send verification email');
  }
  
  return 'Verification email sent successfully';
}
```

---

### Example 11: Form Validator Class
```typescript
import { isValidEmail } from '@/utils/validators';

class FormValidator {
  private errors: Record<string, string> = {};
  
  validateEmail(email: string, fieldName = 'email'): boolean {
    if (!email) {
      this.errors[fieldName] = 'Email is required';
      return false;
    }
    
    if (!isValidEmail(email)) {
      this.errors[fieldName] = 'Invalid email format';
      return false;
    }
    
    delete this.errors[fieldName];
    return true;
  }
  
  validatePassword(password: string, fieldName = 'password'): boolean {
    if (!password) {
      this.errors[fieldName] = 'Password is required';
      return false;
    }
    
    if (password.length < 8) {
      this.errors[fieldName] = 'Password must be at least 8 characters';
      return false;
    }
    
    delete this.errors[fieldName];
    return true;
  }
  
  isValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }
  
  getErrors(): Record<string, string> {
    return { ...this.errors };
  }
  
  reset(): void {
    this.errors = {};
  }
}

// Usage
const validator = new FormValidator();
validator.validateEmail('john@example.com');
validator.validatePassword('SecurePass123');

if (validator.isValid()) {
  console.log('Form is valid!');
} else {
  console.log('Errors:', validator.getErrors());
}
```

---

### Example 12: Integration with Form Library (React Hook Form)
```typescript
import { isValidEmail } from '@/utils/validators';
import { useForm } from 'react-hook-form';

interface FormData {
  email: string;
  password: string;
}

function RegistrationFormWithRHF() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email', {
          required: 'Email is required',
          validate: (value) => 
            isValidEmail(value) || 'Invalid email format'
        })}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters'
          }
        })}
        type="password"
        placeholder="Password"
      />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Register</button>
    </form>
  );
}
```

---

## Integration with Form Submissions

### Example: Multi-Step Form with Email Validation
```typescript
import { isValidEmail, extractDomain } from '@/utils/validators';

function MultiStepForm() {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };
  
  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };
  
  const handleSubmit = async () => {
    const domain = extractDomain(formData.email);
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        domain
      })
    });
    
    if (response.ok) {
      console.log('Registration successful');
    }
  };
  
  return (
    <div>
      {step === 1 && (
        <div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              email: e.target.value
            }))}
            placeholder="Email"
          />
          {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
          <button onClick={handleNext}>Next</button>
        </div>
      )}
      
      {step === 2 && (
        <div>
          <input
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              firstName: e.target.value
            }))}
            placeholder="First Name"
          />
          <input
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              lastName: e.target.value
            }))}
            placeholder="Last Name"
          />
          <button onClick={handleSubmit}>Register</button>
        </div>
      )}
    </div>
  );
}
```

---

## Custom Validation Examples

### More Strict Email Validation
```typescript
// RFC 5322 compliant pattern (more complex)
function isValidEmailStrict(email: string): boolean {
  if (!email) return false;
  
  const strictPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Additional checks
  if (email.length > 254) return false; // RFC 5321 max length
  if (email.startsWith('.')) return false;
  if (email.endsWith('.')) return false;
  if (email.includes('..')) return false;
  
  return strictPattern.test(email);
}
```

---

### Email Domain Whitelist Validation
```typescript
import { extractDomain, isValidEmail } from '@/utils/validators';

function isWhitelistedEmail(email: string, whitelist: string[]): boolean {
  if (!isValidEmail(email)) return false;
  
  const domain = extractDomain(email);
  return domain ? whitelist.includes(domain) : false;
}

// Usage
const corporateDomains = ['company.com', 'corp.example.com'];
console.log(isWhitelistedEmail('john@company.com', corporateDomains)); // true
console.log(isWhitelistedEmail('john@personal.com', corporateDomains)); // false
```

---

## Testing

### Unit Tests

#### Test 1: Valid Emails
```typescript
import { isValidEmail } from '@/utils/validators';

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('john.doe@company.co.uk')).toBe(true);
    expect(isValidEmail('a@b.c')).toBe(true);
  });
});
```

---

#### Test 2: Invalid Emails
```typescript
it('should reject invalid email addresses', () => {
  expect(isValidEmail('invalid')).toBe(false);
  expect(isValidEmail('@example.com')).toBe(false);
  expect(isValidEmail('user@')).toBe(false);
  expect(isValidEmail('user @example.com')).toBe(false);
  expect(isValidEmail('')).toBe(false);
});
```

---

#### Test 3: Domain Extraction
```typescript
import { extractDomain } from '@/utils/validators';

describe('extractDomain', () => {
  it('should extract domain correctly', () => {
    expect(extractDomain('user@example.com')).toBe('example.com');
    expect(extractDomain('john@COMPANY.COM')).toBe('company.com');
    expect(extractDomain('test@sub.domain.com')).toBe('sub.domain.com');
  });
  
  it('should return null for invalid emails', () => {
    expect(extractDomain('no-at-sign')).toBe(null);
    expect(extractDomain('')).toBe(null);
  });
});
```

---

## Performance Considerations

### Regex Efficiency
```typescript
// Pre-compile regex for better performance
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailOptimized(email: string): boolean {
  if (!email) return false;
  return EMAIL_REGEX.test(email);
}
```

---

### Validation in Lists
```typescript
// Efficient: validate only once
const validEmails = emails.filter(email => isValidEmail(email));

// Less efficient: redundant validation
const processedEmails = emails.map(email => {
  if (isValidEmail(email)) { // First check
    return email;
  }
}).filter(email => isValidEmail(email)); // Second check!
```

---

## Error Handling and Edge Cases

### Null/Empty Handling
```typescript
// Safe handling
const email: string | null = getUserEmail();
const isValid = email ? isValidEmail(email) : false;

// Extract domain safely
const domain = email ? extractDomain(email) : null;
```

---

### Trimming and Normalization
```typescript
// User might paste with whitespace
function validateAndNormalize(email: string): { valid: boolean; normalized: string } {
  const trimmed = email.trim().toLowerCase();
  return {
    valid: isValidEmail(trimmed),
    normalized: trimmed
  };
}
```

---

## Related Documentation

- [dateFormatter.ts Documentation](dateFormatter_doc.md) - Related utility
- [AuthContext Documentation](../context/AuthContext_doc.md) - Uses email validation
- [Form Components](../components/) - Integration with forms

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| TypeScript | Type safety |
| No external packages | Lightweight implementation |

---

## Common Pitfalls

### ❌ Pitfall 1: Trusting Client-Side Validation Only
```typescript
// DON'T DO THIS
if (isValidEmail(email)) {
  submitForm(); // No backend validation!
}
```

### ✅ Solution
```typescript
// DO THIS - Validate both client and server
if (isValidEmail(email)) {
  submitToBackend(email); // Backend validates again
}
```

---

### ❌ Pitfall 2: Not Normalizing Email Input
```typescript
// DON'T DO THIS
const email = userInput; // Might have whitespace or uppercase
```

### ✅ Solution
```typescript
// DO THIS - Normalize before validation
const email = userInput.trim().toLowerCase();
if (isValidEmail(email)) {
  // Process normalized email
}
```

---

## Future Enhancements

1. Strict RFC 5322 compliance
2. DNS validation for domain existence
3. Email disposability checking
4. Localized error messages
5. Custom validation rules

---

## Metadata

| Property | Value |
|----------|-------|
| **File Size** | ~20 lines |
| **Complexity** | Low |
| **External Dependencies** | None |
| **Last Reviewed** | January 24, 2026 |
| **Status** | Active - Production Ready |

---

*Documentation generated for AKR documentation system. See related files for complete utility documentation.*
