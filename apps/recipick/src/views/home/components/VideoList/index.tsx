'use client';

import { Loader2 } from 'lucide-react';
import { Skeleton } from '@workspace/ui/components/skeleton';
import VideoCard from '@/components/VideoCard';
import { useVideoList } from './useVideoList';

interface VideoListProps {
  query: string;
  onVideoClick: (videoId: string) => void;
}

export default function VideoList({ query, onVideoClick }: VideoListProps) {
  const { videos, isLoading, isFetchingNextPage, sentinelRef } = useVideoList(query);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
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
      <p className="text-[13px] text-[#7d6550] mb-4">&ldquo;{query}&rdquo; 검색 결과</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {videos.map((video) => (
          <VideoCard key={video.videoId} video={video} onClick={onVideoClick} />
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center items-center gap-2 mt-8 py-4 text-[#9e7b5a]">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-[13px] text-[#7d6550]">더 불러오는 중…</span>
        </div>
      )}

      {/* Intersection Observer sentinel */}
      <div ref={sentinelRef} className="h-1" />
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
