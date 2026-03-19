'use client';

import VideoCard from '@/components/VideoCard';
import { useFeaturedRecipesQuery } from '@/queries/featured';
import { Skeleton } from '@workspace/ui/components/skeleton';

interface FeaturedRecipesProps {
  onSearch: (query: string) => void;
}

const HINT_QUERIES = ['백종원', '1분요리', '쉐프의 테이블', '만개의레시피'];

export default function FeaturedRecipes({ onSearch }: FeaturedRecipesProps) {
  const { data, isLoading } = useFeaturedRecipesQuery();
  const videos = data?.videos ?? [];

  return (
    <div className="flex flex-col gap-8">
      {/* 힌트 검색어 */}
      <div className="flex flex-col items-center gap-3 pt-8 text-center">
        <p className="text-[14px] text-[#7d6550] break-keep">
          요리 채널을 검색하면 레시피와 재료를 한 번에 확인할 수 있어요
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {HINT_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => onSearch(q)}
              className="bg-white border-[1.5px] border-[#ddd0bc] rounded-full px-4 py-1.5 text-[13px]
                         text-[#9e7b5a] font-medium hover:border-[#9e7b5a] hover:bg-[#f5ede0]
                         transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 최근 레시피 그리드 */}
      {(isLoading || videos.length > 0) && (
        <div>
          <h2 className="text-[15px] font-bold text-[#3d2b1f] mb-4">🕐 최근 레시피</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden border-[1.5px] border-[#ddd0bc]"
                  >
                    <Skeleton className="aspect-video w-full" />
                    <div className="p-3.5 space-y-2">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              : videos.map((video) => <VideoCard key={video.videoId} video={video} />)}
          </div>
        </div>
      )}
    </div>
  );
}
