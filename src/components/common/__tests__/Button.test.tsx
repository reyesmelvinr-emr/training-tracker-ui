import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from '../Button';
import { describe, it, expect } from 'vitest';

describe('Button', () => {
  it('renders label', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
});
