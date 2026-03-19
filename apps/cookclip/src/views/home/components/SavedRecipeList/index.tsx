'use client';

import { Heart, Search } from 'lucide-react';
import Link from 'next/link';
import VideoCard from '@/components/VideoCard';
import { useSavedRecipeItemsQuery } from '@/queries/user-recipes';
import { useAuth } from '@/hooks/useAuth';

interface SavedRecipeListProps {
  onSearch: (query: string) => void;
}

export default function SavedRecipeList({ onSearch }: SavedRecipeListProps) {
  const { user } = useAuth();
  const { data, isLoading } = useSavedRecipeItemsQuery();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#f5ede0] flex items-center justify-center mb-4">
          <Heart size={28} className="text-[#c4a882]" />
        </div>
        <p className="text-[15px] font-semibold text-[#3d2b1f] mb-1 break-keep">
          좋아요한 레시피를 저장해보세요
        </p>
        <p className="text-[13px] text-[#7d6550] mb-6 break-keep">
          로그인하면 마음에 드는 레시피를 모아볼 수 있어요
        </p>
        <Link
          href="/login"
          className="px-5 py-2.5 bg-[#c4724a] text-white text-[13px] font-semibold rounded-full hover:bg-[#b0623d] transition-colors"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <h2 className="text-[15px] font-bold text-[#3d2b1f] mb-4">좋아요한 레시피</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-[#ddd0bc]">
              <div className="aspect-video bg-[#f0e8dc] animate-pulse" />
              <div className="p-3.5 space-y-2">
                <div className="h-3 bg-[#f0e8dc] rounded animate-pulse w-2/3" />
                <div className="h-3 bg-[#f0e8dc] rounded animate-pulse" />
                <div className="h-3 bg-[#f0e8dc] rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const videos = data?.videos ?? [];

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#f5ede0] flex items-center justify-center mb-4">
          <Search size={28} className="text-[#c4a882]" />
        </div>
        <p className="text-[15px] font-semibold text-[#3d2b1f] mb-1 break-keep">
          아직 저장한 레시피가 없어요
        </p>
        <p className="text-[13px] text-[#7d6550] mb-6 break-keep">
          요리 영상을 검색하고 마음에 드는 레시피를 저장해보세요
        </p>
        <button
          onClick={() => onSearch('오늘의 요리')}
          className="px-5 py-2.5 bg-[#c4724a] text-white text-[13px] font-semibold rounded-full hover:bg-[#b0623d] transition-colors"
        >
          레시피 둘러보기
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Heart size={16} className="fill-[#c4724a] stroke-[#c4724a]" />
        <h2 className="text-[15px] font-bold text-[#3d2b1f]">
          좋아요한 레시피
          <span className="ml-1.5 text-[13px] font-normal text-[#a89880]">{videos.length}개</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {videos.map((video) => (
          <VideoCard key={video.videoId} video={video} />
        ))}
      </div>
    </div>
  );
}
