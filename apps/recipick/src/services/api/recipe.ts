import Services from '@workspace/services';
import type { Recipe, RecipeResponse } from '@/types/api/routeApi/response';

type VideoDetail = { title: string; thumbnail: string; channelName: string };

interface StreamHandlers {
  onVideoDetail: (data: VideoDetail) => void;
  onRecipe: (data: Recipe) => void;
  onError: (data: { message: string; status: number; errorCode?: string }) => void;
}

class RecipeServices extends Services {
  constructor({ baseURL }: { baseURL: string }) {
    super({ baseURL });
    this.getAxiosInstance().defaults.timeout = 120_000; // 2분: OpenAI + YouTube 스크래핑 소요 시간 고려
  }

  getRecipe(videoId: string): Promise<RecipeResponse> {
    return this.post<RecipeResponse>('', { videoId });
  }

  // SSE 스트리밍: video_detail(~1s) → recipe(5-15s) 순서로 이벤트 수신
  // Axios는 SSE 스트림 처리 불가 → native fetch 사용
  async streamRecipe(
    videoId: string,
    handlers: StreamHandlers,
    signal?: AbortSignal,
  ): Promise<void> {
    const res = await fetch('/api/recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
      signal: signal ?? AbortSignal.timeout(120_000),
    });

    if (!res.body) throw new Error('응답 스트림을 읽을 수 없습니다');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE는 빈 줄(\n\n)로 이벤트 블록을 구분
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() ?? '';

      for (const block of blocks) {
        const eventMatch = block.match(/^event: (\w+)/m);
        const dataMatch = block.match(/^data: (.+)/m);
        if (!eventMatch || !dataMatch) continue;

        const event = eventMatch[1];
        const data = JSON.parse(dataMatch[1]);

        if (event === 'video_detail') handlers.onVideoDetail(data as VideoDetail);
        else if (event === 'recipe') handlers.onRecipe(data as Recipe);
        else if (event === 'error') handlers.onError(data as { message: string; status: number });
      }
    }
  }

  prewarmRecipes(videoIds: string[]): Promise<{ queued: number }> {
    return fetch('/api/recipe/prewarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoIds }),
    }).then((r) => r.json());
  }
}

const recipeServices = new RecipeServices({
  baseURL: `/api/recipe`,
});

export default recipeServices;
