const TAG_CODE_RE = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export function isValidTagCode(raw: string): boolean {
  return TAG_CODE_RE.test(raw.toUpperCase());
}
