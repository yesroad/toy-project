'use client';

import { FormEvent, useState, useEffect } from 'react';

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
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  };

  return { value, setValue, handleSubmit, isLoading };
}
