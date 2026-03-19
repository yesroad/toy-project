const NON_SCALABLE_PATTERNS = [
  '적당량',
  '약간',
  '조금',
  '소금간',
  '취향껏',
  '기호',
  '조절',
  '한꼬집',
];

/**
 * "2인분", "3~4인분" 등에서 기준 인원수 파싱
 */
export function parseServings(servings: string): number {
  // "3~4인분" → 3 (하한값 기준)
  const rangeMatch = servings.match(/(\d+)\s*[~～\-]\s*\d+/);
  if (rangeMatch) return parseInt(rangeMatch[1], 10);

  const singleMatch = servings.match(/(\d+)/);
  if (singleMatch) return parseInt(singleMatch[1], 10);

  return 2;
}

/**
 * 재료량 문자열에 배율 적용. 비정형 단위는 원본 반환.
 * 예: "200g" × 2 → "400g", "1/2컵" × 2 → "1컵"
 */
export function scaleAmount(amount: string, factor: number): string {
  if (!amount || factor === 1) return amount;
  if (NON_SCALABLE_PATTERNS.some((p) => amount.includes(p))) return amount;

  const numericMatch = amount.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*(.*)$/);
  if (!numericMatch) return amount;

  const [, numStr, unit] = numericMatch;

  let num: number;
  if (numStr.includes('/')) {
    const [n, d] = numStr.split('/').map(Number);
    num = n / d;
  } else {
    num = parseFloat(numStr);
  }

  const scaled = num * factor;
  const formatted = Number.isInteger(scaled)
    ? String(scaled)
    : parseFloat(scaled.toFixed(1)).toString();

  return `${formatted}${unit}`;
}
