'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-[#7d6550] hover:text-[#c4724a] transition-colors text-[13px] font-medium"
      aria-label="공유"
    >
      {copied ? <Check size={15} className="text-[#c4724a]" /> : <Share2 size={15} />}
      {copied ? '복사됨' : '공유'}
    </button>
  );
}
