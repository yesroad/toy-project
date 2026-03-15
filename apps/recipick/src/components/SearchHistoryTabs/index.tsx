'use client';

import { X } from 'lucide-react';
import type { SearchTab } from '@/lib/search-history';

interface SearchHistoryTabsProps {
  tabs: SearchTab[];
  activeQuery: string;
  onTabClick: (query: string) => void;
  onTabRemove: (id: string) => void;
}

export default function SearchHistoryTabs({
  tabs,
  activeQuery,
  onTabClick,
  onTabRemove,
}: SearchHistoryTabsProps) {
  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[#a89880] text-xs shrink-0">🕐</span>
      {tabs.map((tab) => {
        const isActive = tab.query === activeQuery;
        return (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.query)}
            className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150 shadow-sm cursor-pointer
              ${
                isActive
                  ? 'bg-[#9e7b5a] border-[#9e7b5a] text-white'
                  : 'bg-white border-[#ddd0bc] text-[#3d2b1f] hover:border-[#9e7b5a] hover:bg-[#f5ede0] hover:text-[#7d5f42]'
              }`}
          >
            {tab.query}
            <span
              role="button"
              aria-label={`${tab.query} 탭 삭제`}
              onClick={(e) => {
                e.stopPropagation();
                onTabRemove(tab.id);
              }}
              className={`inline-flex items-center justify-center w-4 h-4 rounded-full transition-colors cursor-pointer
                ${
                  isActive
                    ? 'text-white/70 hover:text-white hover:bg-white/20'
                    : 'text-[#a89880] hover:text-[#7d5f42] hover:bg-[#9e7b5a]/15'
                }`}
            >
              <X size={10} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
