'use client';

import { FormEvent, useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  defaultValue?: string;
  isLoading?: boolean;
}

export default function SearchBar({
  onSearch,
  defaultValue = '',
  isLoading = false,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-white border-[1.5px] border-[#ddd0bc] rounded-full px-5 py-2 shadow-sm
                 focus-within:border-[#9e7b5a] focus-within:ring-[3px] focus-within:ring-[#9e7b5a]/10
                 transition-all duration-200"
    >
      <Search size={17} className="text-[#a89880] shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="요리 채널을 검색해보세요 (예: 백종원, 1분요리)"
        className="flex-1 bg-transparent outline-none text-[15px] text-[#3d2b1f] placeholder:text-[#a89880] break-keep"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="bg-[#c4724a] hover:bg-[#b5623d] active:scale-95 text-white rounded-2xl px-5 py-2.5
                   text-sm font-semibold transition-all duration-150
                   disabled:opacity-60 disabled:cursor-not-allowed
                   min-h-[40px] min-w-[80px] shrink-0 cursor-pointer"
      >
        {isLoading ? '검색 중…' : '검색'}
      </button>
    </form>
  );
}
