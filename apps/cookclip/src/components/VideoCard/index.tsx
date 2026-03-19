'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { VideoItem } from '@/types/api/routeApi/response';
import SaveRecipeButton from '@/components/SaveRecipeButton';

interface VideoCardProps {
  video: VideoItem;
}

export default function VideoCard({ video }: VideoCardProps) {
  const formattedDate = new Date(video.publishedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const initial = video.channelName.charAt(0);
  const isShorts = video.title.toLowerCase().includes('#shorts') || video.title.includes('#쇼츠');

  return (
    <div className="relative">
      <Link
        href={`/recipe/${video.videoId}`}
        className="bg-white rounded-2xl overflow-hidden border-[1.5px] border-[#ddd0bc]
                   shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#c4a882]
                   transition-all duration-200 group block"
      >
        <div className="relative aspect-video overflow-hidden bg-[#f5ede0]">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 960px) 33vw, 280px"
          />
          {isShorts && (
            <span className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
              📱 Shorts
            </span>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
              <span className="text-[#3d2b1f] text-base pl-0.5">▶</span>
            </div>
          </div>
        </div>

        <div className="p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#c4a882] to-[#c4724a] flex items-center justify-center text-[11px] text-white font-bold shrink-0">
              {initial}
            </div>
            <span className="text-xs text-[#7d6550] font-medium truncate">{video.channelName}</span>
          </div>
          <h3 className="text-[13px] font-semibold text-[#3d2b1f] leading-snug line-clamp-2 break-keep mb-2.5 min-h-[2.4em]">
            {video.title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#a89880]">{formattedDate}</span>
            <span className="inline-flex items-center gap-1 bg-[#f5ede0] text-[#7d5f42] text-[11px] font-semibold px-2 py-1 rounded-full">
              🍽 레시피
            </span>
          </div>
        </div>
      </Link>
      <SaveRecipeButton videoId={video.videoId} variant="hero" />
    </div>
  );
}
