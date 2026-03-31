export function formatMegapixels(pixels: number) {
  return `${(pixels / 1_000_000).toFixed(1)}MP`;
}

export function summarizeUploadIssues(issues: string[]) {
  return issues.length <= 3
    ? issues.join("; ")
    : `${issues.slice(0, 3).join("; ")}; and ${issues.length - 3} more.`;
}
