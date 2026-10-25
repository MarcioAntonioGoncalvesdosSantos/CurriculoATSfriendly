export type DiffOp =
  | { type: 'same'; text: string }
  | { type: 'added'; text: string }
  | { type: 'removed'; text: string };

/** Diff de linhas por subsequência comum mais longa (LCS). */
export function lineDiff(before: string, after: string): DiffOp[] {
  const a = before.split(/\r?\n/);
  const b = after.split(/\r?\n/);
  const rows = a.length;
  const cols = b.length;
  const table: number[][] = Array.from({ length: rows + 1 }, () => new Array<number>(cols + 1).fill(0));

  for (let i = rows - 1; i >= 0; i--) {
    for (let j = cols - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < rows && j < cols) {
    if (a[i] === b[j]) {
      ops.push({ type: 'same', text: a[i] });
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      ops.push({ type: 'removed', text: a[i] });
      i++;
    } else {
      ops.push({ type: 'added', text: b[j] });
      j++;
    }
  }
  while (i < rows) ops.push({ type: 'removed', text: a[i++] });
  while (j < cols) ops.push({ type: 'added', text: b[j++] });
  return ops;
}

/** Lista apenas o que mudou, agrupado por seção. */
export function changeSummary(before: string, after: string): { added: string[]; removed: string[] } {
  const ops = lineDiff(before, after);
  return {
    added: ops.filter((op) => op.type === 'added').map((op) => op.text).filter(Boolean),
    removed: ops.filter((op) => op.type === 'removed').map((op) => op.text).filter(Boolean),
  };
}
