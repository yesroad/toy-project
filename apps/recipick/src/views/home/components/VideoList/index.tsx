'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@workspace/ui/components/skeleton';
import VideoCard from '@/components/VideoCard';
import recipeServices from '@/services/api/recipe';
import { useVideoList } from './useVideoList';

interface VideoListProps {
  query: string;
  onVideoClick: (videoId: string) => void;
}

export default function VideoList({ query, onVideoClick }: VideoListProps) {
  const { videos, isLoading, isFetchingNextPage, canLoadMore, handleLoadMore } =
    useVideoList(query);

  // 검색 결과 첫 로드 시 상위 3개 pre-warm (fire-and-forget)
  const videosLength = videos.length;
  useEffect(() => {
    if (videosLength === 0) return;
    const ids = videos.slice(0, 3).map((v) => v.videoId);
    recipeServices.prewarmRecipes(ids).catch(() => {});
  }, [videosLength]); // videos 참조 안정성 불필요 — 길이 변경 시에만 실행

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-4xl">🔍</p>
        <p className="text-[15px] font-semibold text-[#3d2b1f]">검색 결과가 없어요</p>
        <p className="text-[13px] text-[#a89880]">다른 키워드를 시도해보세요</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <p className="text-[13px] text-[#7d6550]">&ldquo;{query}&rdquo; 검색 결과</p>
      </div>
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {videos.map((video) => (
          <VideoCard key={video.videoId} video={video} onClick={onVideoClick} />
        ))}
      </div>

      {canLoadMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            className="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-[12px] border-[1.5px] border-[#9e7b5a] bg-transparent text-[13px] font-semibold text-[#9e7b5a] hover:bg-[#f5ede0] disabled:opacity-60 transition-all"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>불러오는 중…</span>
              </>
            ) : (
              <span>더 불러오기 ↓</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function VideoCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border-[1.5px] border-[#ddd0bc]">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-3.5 space-y-2.5">
        <Skeleton className="h-3.5 w-2/5" />
        <Skeleton className="h-3.5 w-11/12" />
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
