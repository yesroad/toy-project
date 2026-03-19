'use client';

import { Search, Link2, Loader2 } from 'lucide-react';
import { useSearchBar } from './useSearchBar';
import type { SearchMode } from './useSearchBar';

interface SearchBarProps {
  onSearch: (query: string) => void;
  defaultValue?: string;
  isLoading?: boolean;
}

const TABS: { mode: SearchMode; label: string }[] = [
  { mode: 'keyword', label: '키워드' },
  { mode: 'url', label: 'URL' },
];

export default function SearchBar({
  onSearch,
  defaultValue = '',
  isLoading = false,
}: SearchBarProps) {
  const { value, setValue, handleSubmit, searchMode, handleModeChange, urlError } = useSearchBar({
    defaultValue,
    isLoading,
    onSearch,
  });

  return (
    <div className="flex flex-col gap-2">
      {/* 탭 바 */}
      <div className="inline-flex bg-[#f5ede0] rounded-full p-1 self-start">
        {TABS.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleModeChange(mode)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
              searchMode === mode
                ? 'bg-white text-[#3d2b1f] shadow-sm'
                : 'text-[#9e7b5a] hover:text-[#3d2b1f]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 검색 폼 */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-white border-[1.5px] border-[#ddd0bc] rounded-full px-5 py-2 shadow-sm
                   focus-within:border-[#9e7b5a] focus-within:ring-[3px] focus-within:ring-[#9e7b5a]/10
                   transition-all duration-200"
      >
        {searchMode === 'keyword' ? (
          <Search size={17} className="text-[#a89880] shrink-0" />
        ) : (
          <Link2 size={17} className="text-[#a89880] shrink-0" />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            searchMode === 'keyword'
              ? '요리 및 채널을 검색해보세요 (예: 1분요리, 김치찌개)'
              : 'YouTube URL을 붙여넣으세요'
          }
          className={`flex-1 bg-transparent outline-none text-[15px] text-[#3d2b1f] placeholder:text-[#a89880] break-keep ${
            urlError ? 'text-red-600' : ''
          }`}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className={`hover:opacity-90 active:scale-95 text-white rounded-2xl px-5 py-2.5
                     text-sm font-semibold transition-all duration-150
                     disabled:opacity-60 disabled:cursor-not-allowed
                     min-h-[40px] min-w-[80px] shrink-0 cursor-pointer ${
                       searchMode === 'url' ? 'bg-[#9e7b5a]' : 'bg-[#c4724a]'
                     }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 size={14} className="animate-spin" />
              검색 중
            </span>
          ) : searchMode === 'url' ? (
            '이동'
          ) : (
            '검색'
          )}
        </button>
      </form>

      {/* URL 에러 메시지 */}
      {urlError && (
        <p className="text-[12px] text-red-500 px-1">
          {urlError} — youtube.com/watch?v=… 또는 youtu.be/… 형식을 지원해요
        </p>
      )}
    </div>
  );
}
