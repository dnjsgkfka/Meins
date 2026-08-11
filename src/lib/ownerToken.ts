// localStorage 키: `mcm:own:${tagCode}` (태그별 분리 저장)
// 저장 값: 서버가 발급한 토큰 문자열 전체를 opaque로 저장 — 파싱 불필요

function storageKey(tagCode: string): string {
  return `mcm:own:${tagCode}`;
}

export function getToken(tagCode: string): string | null {
  return localStorage.getItem(storageKey(tagCode));
}

export function setToken(tagCode: string, token: string): void {
  localStorage.setItem(storageKey(tagCode), token);
}

export function clearToken(tagCode: string): void {
  localStorage.removeItem(storageKey(tagCode));
}
