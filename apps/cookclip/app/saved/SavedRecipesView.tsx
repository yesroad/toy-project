'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/hooks/useAuth';
import { useSavedRecipeItemsQuery } from '@/queries/user-recipes';

export default function SavedRecipesView() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading: recipesLoading } = useSavedRecipeItemsQuery();
  const videos = data?.videos ?? [];

  return (
    <div className="min-h-screen bg-[#fdf8f4]">
      {/* 네비 */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#ede3d8] px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[#7d6550] hover:text-[#c4724a] transition-colors text-[14px] font-medium"
        >
          <ArrowLeft size={16} />
          돌아가기
        </Link>
        <span className="text-[#ddd0bc]">|</span>
        <span className="text-[14px] font-bold text-[#3d2b1f]">❤️ 나의 레시피</span>
        <div className="ml-auto">
          <AuthButton />
        </div>
      </nav>

      <main className="max-w-[960px] mx-auto px-4 py-8">
        {authLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#c4724a]/60" />
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-[#f5ede0] flex items-center justify-center text-4xl">
              ❤️
            </div>
            <h2 className="text-xl font-bold text-[#3d2b1f]">로그인이 필요해요</h2>
            <p className="text-[14px] text-[#7d6550]">
              로그인하면 마음에 드는 레시피를 저장할 수 있어요
            </p>
            <AuthButton />
          </div>
        ) : recipesLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#c4724a]/60" />
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-[#f5ede0] flex items-center justify-center text-4xl">
              📭
            </div>
            <h2 className="text-xl font-bold text-[#3d2b1f]">저장된 레시피가 없어요</h2>
            <p className="text-[14px] text-[#7d6550]">레시피 페이지에서 하트를 눌러 저장해보세요</p>
            <Link href="/" className="text-[14px] text-[#c4724a] font-semibold hover:underline">
              레시피 찾으러 가기
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-[17px] font-bold text-[#3d2b1f] mb-5">
              저장한 레시피{' '}
              <span className="text-[#a89880] font-normal text-[14px]">{videos.length}개</span>
            </h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {videos.map((video) => (
                <VideoCard key={video.videoId} video={video} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
