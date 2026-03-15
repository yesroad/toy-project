'use client';

import { useEffect, useState } from 'react';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useInfiniteSearchQuery } from '@/queries/search';
import SearchBar from '@/components/SearchBar';
import SearchHistoryTabs from '@/components/SearchHistoryTabs';
import RecipeModal from '@/components/RecipeModal';
import VideoList from './components/VideoList';
import EmptyState from './components/EmptyState';

export default function HomeView() {
  const [query, setQuery] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { tabs, add, remove } = useSearchHistory();

  const { data, isLoading } = useInfiniteSearchQuery(query);
  const videos = data?.pages.flatMap((page) => page.videos) ?? [];

  // 검색 완료 후 결과가 있을 때만 기록 저장
  useEffect(() => {
    if (query && !isLoading && videos.length > 0) {
      add(query);
    }
  }, [query, isLoading, videos.length, add]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* 헤더 */}
      <header className="bg-gradient-to-b from-[#f0e8dc] to-[#faf7f2] px-4 pt-12 pb-8 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-11 h-11 bg-[#c4724a] rounded-xl flex items-center justify-center text-2xl shadow-md">
            🍳
          </div>
          <h1 className="text-[28px] font-extrabold text-[#3d2b1f] tracking-tight">
            Reci<span className="text-[#c4724a]">pick</span>
          </h1>
        </div>
        <p className="text-[14px] text-[#7d6550] mb-5 break-keep">
          유튜브 요리 영상을 <span className="text-[#c4724a] font-semibold">pick</span>하고
          <br />
          레시피와 재료를 한 번에 확인하세요
        </p>
        <div className="max-w-[600px] mx-auto">
          <SearchBar onSearch={handleSearch} defaultValue={query} isLoading={isLoading} />
        </div>
      </header>

      {/* 검색 기록 탭 */}
      {tabs.length > 0 && (
        <div className="bg-white border-b border-[#ddd0bc] px-4 py-3">
          <div className="max-w-[960px] mx-auto">
            <SearchHistoryTabs
              tabs={tabs}
              activeQuery={query}
              onTabClick={setQuery}
              onTabRemove={remove}
            />
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="max-w-[960px] mx-auto px-4 py-6 pb-16">
        {query ? (
          <VideoList query={query} onVideoClick={setSelectedVideoId} />
        ) : (
          <EmptyState onHintClick={handleSearch} />
        )}
      </main>

      {/* 레시피 모달 */}
      <RecipeModal videoId={selectedVideoId} onClose={() => setSelectedVideoId(null)} />
    </div>
  );
}
