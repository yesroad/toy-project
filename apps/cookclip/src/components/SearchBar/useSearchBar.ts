'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { extractVideoIdFromUrl } from '@/lib/youtube';

export type SearchMode = 'keyword' | 'url';

interface UseSearchBarProps {
  defaultValue?: string;
  isLoading?: boolean;
  onSearch: (query: string) => void;
}

export function useSearchBar({
  defaultValue = '',
  isLoading = false,
  onSearch,
}: UseSearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [searchMode, setSearchMode] = useState<SearchMode>('keyword');
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
    setValue('');
    setUrlError('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    if (searchMode === 'url') {
      const videoId = extractVideoIdFromUrl(trimmed);
      if (videoId) {
        router.push(`/recipe/${videoId}`);
      } else {
        setUrlError('올바른 YouTube URL이 아닙니다');
      }
      return;
    }

    onSearch(trimmed);
  };

  return { value, setValue, handleSubmit, isLoading, searchMode, handleModeChange, urlError };
}
