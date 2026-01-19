import { render, screen } from '@testing-library/react';
import React from 'react';
import { Table } from '../Table';
import { describe, it, expect } from 'vitest';

describe('Table', () => {
  it('renders headers and rows', () => {
    const rows = [ { id: 1, name: 'Row1' }, { id: 2, name: 'Row2' } ];
  render(<Table columns={[{ id: 'name', header: 'Name', accessor: (r) => r.name }]} data={rows} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Row1')).toBeInTheDocument();
    expect(screen.getByText('Row2')).toBeInTheDocument();
  });
});
