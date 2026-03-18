// SSE(Server-Sent Events) 파싱 관련 순수 함수

interface SseBlock {
  event: string | null;
  data: string | null;
}

/**
 * SSE 이벤트 블록 문자열을 파싱하여 event와 data를 추출.
 * SSE 이벤트 블록은 빈 줄(\n\n)로 구분되며 각 블록 내에
 * "event: <name>" 과 "data: <json>" 형식의 줄이 포함됨.
 */
export function parseSseBlock(block: string): SseBlock {
  const eventMatch = block.match(/^event: (\w+)/m);
  const dataMatch = block.match(/^data: (.+)/m);
  return {
    event: eventMatch?.[1] ?? null,
    data: dataMatch?.[1] ?? null,
  };
}
