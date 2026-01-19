import React from 'react';
import styles from './Table.module.css';

export interface Column<T> { id: string; header: string; accessor: (row: T) => React.ReactNode; }
export interface TableProps<T> { columns: Column<T>[]; data: T[]; emptyMessage?: string; caption?: string; }

export function Table<T>({ columns, data, emptyMessage = 'No data', caption }: TableProps<T>) {
  return (
    <div className={styles.tableWrapper}>
      <table>
        {caption && <caption style={{ textAlign: 'left', marginBottom: 4 }}>{caption}</caption>}
        <thead>
          <tr>
            {columns.map(col => <th key={col.id}>{col.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td className={styles.empty} colSpan={columns.length}>{emptyMessage}</td>
            </tr>
          )}
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => <td key={col.id}>{col.accessor(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}