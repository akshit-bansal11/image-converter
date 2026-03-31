export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function parseRanges(str: string, maxPages: number): number[] {
  const indices = new Set<number>();
  if (!str.trim()) return [];

  for (const part of str.split(",")) {
    const range = part.trim().split("-");
    if (range.length === 1) {
      const page = parseInt(range[0], 10);
      if (page >= 1 && page <= maxPages) indices.add(page - 1);
      continue;
    }

    if (range.length !== 2) continue;
    const start = parseInt(range[0], 10);
    const end = parseInt(range[1], 10);
    if (start < 1 || end < start || end > maxPages) continue;

    for (let page = start; page <= end; page++) {
      indices.add(page - 1);
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}
