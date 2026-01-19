import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge } from '../StatusBadge';
import { describe, it, expect } from 'vitest';

describe('StatusBadge', () => {
  it('shows text', () => {
  render(<StatusBadge tone="success">Active</StatusBadge>);
  expect(screen.getByRole('status', { name: /active/i })).toBeInTheDocument();
  });
});
