export function formatSize(
  size: { width: number; depth: number; height: number } | null | undefined,
): string | undefined {
  if (!size) return undefined;
  return `${size.width} × ${size.depth} × ${size.height} cm`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
