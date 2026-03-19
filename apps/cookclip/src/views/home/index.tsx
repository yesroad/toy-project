'use client';

import type { ReactNode } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchHistoryTabs from '@/components/SearchHistoryTabs';
import VideoList from './components/VideoList';
import SavedRecipeList from './components/SavedRecipeList';
import { useHomeView } from './useHomeView';

interface HomeViewProps {
  hero?: ReactNode;
}

export default function HomeView({ hero }: HomeViewProps) {
  const { query, tabs, isLoading, handleSearch, handleTabRemove, setQuery } = useHomeView();

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* 헤더 */}
      <header className="bg-gradient-to-b from-[#f0e8dc] to-[#faf7f2] px-4 pt-12 pb-8 text-center">
        {hero}
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
              onTabRemove={handleTabRemove}
            />
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="max-w-[960px] mx-auto px-4 py-6 pb-16">
        {query ? <VideoList query={query} /> : <SavedRecipeList onSearch={handleSearch} />}
      </main>
    </div>
  );
}
