import Services from '@workspace/services';
import type { CoupangLinkRequest } from '@/types/api/coupang/request';
import type { CoupangLinkResponse } from '@/types/api/coupang/response';

class CoupangServices extends Services {
  constructor({ baseURL }: { baseURL: string }) {
    super({ baseURL });
  }

  getLink(params: CoupangLinkRequest): Promise<CoupangLinkResponse> {
    return this.get<CoupangLinkResponse>('', {
      keyword: params.keyword,
      ...(params.videoId && { videoId: params.videoId }),
    });
  }
}

const coupangServices = new CoupangServices({
  baseURL: `/api/coupang`,
});

export default coupangServices;
