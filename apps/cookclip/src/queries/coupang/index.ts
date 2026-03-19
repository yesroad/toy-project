'use client';

import { useQuery } from '@tanstack/react-query';
import coupangServices from '@/services/api/coupang';
import type { CoupangLinkResponse } from '@/types/api/coupang/response';
import type { UseQueryOptionsBase } from '@/types/queries';
import { coupangKeys } from './queryKeys';

/**
 * 재료 쿠팡 링크 조회 훅
 * keyword가 없으면 쿼리 비활성화. staleTime 24시간 (링크는 자주 바뀌지 않음)
 */
export function useCoupangLinkQuery(
  keyword: string | null,
  videoId?: string,
  options?: UseQueryOptionsBase<CoupangLinkResponse>,
) {
  return useQuery({
    queryKey: coupangKeys.link(keyword ?? '', videoId),
    queryFn: () => coupangServices.getLink({ keyword: keyword!, videoId }),
    enabled: !!keyword,
    staleTime: 24 * 60 * 60 * 1000, // 24시간
    ...options,
  });
}
