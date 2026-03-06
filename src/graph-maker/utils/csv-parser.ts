import type { ParsedData } from '../state/types';

export function parseCSV(input: string): { data: ParsedData | null; error: string | null } {
  const trimmed = input.trim();
  if (!trimmed) return { data: null, error: 'No data provided' };

  // Detect delimiter: tab or comma
  const firstLine = trimmed.split('\n')[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return { data: null, error: 'Need at least a header row and one data row' };

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
  if (headers.length === 0) return { data: null, error: 'No columns found in header' };

  const rows: (string | number)[][] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cells.length !== headers.length) continue; // skip malformed rows
    const row = cells.map(cell => {
      const num = Number(cell);
      return !isNaN(num) && cell !== '' ? num : cell;
    });
    rows.push(row);
  }

  if (rows.length === 0) return { data: null, error: 'No valid data rows found' };

  return { data: { headers, rows }, error: null };
}

export function transposeData(data: ParsedData): ParsedData {
  if (data.rows.length === 0) return data;

  // Original headers become the first column, original first column becomes headers
  const newHeaders = ['label', ...data.rows.map((_, i) => `row_${i + 1}`)];
  const newRows: (string | number)[][] = [];

  for (let col = 0; col < data.headers.length; col++) {
    const row: (string | number)[] = [data.headers[col]];
    for (const dataRow of data.rows) {
      row.push(dataRow[col]);
    }
    newRows.push(row);
  }

  return { headers: newHeaders, rows: newRows };
}
