'use client';

import Link from 'next/link';
import { ArrowLeft, Trash2, ShoppingCart } from 'lucide-react';
import { useShoppingList } from '@/hooks/useShoppingList';

export default function ShoppingListView() {
  const { items, toggle, remove, clearDone } = useShoppingList();
  const checkedCount = items.filter((i) => i.checked).length;

  // videoTitle별 그룹
  const groups = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.videoTitle;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#fdf8f4]">
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#ede3d8] px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[#7d6550] hover:text-[#c4724a] transition-colors text-[14px] font-medium"
        >
          <ArrowLeft size={16} />
          돌아가기
        </Link>
        <span className="text-[#ddd0bc]">|</span>
        <span className="text-[14px] font-bold text-[#3d2b1f]">🛒 장보기 목록</span>
        {checkedCount > 0 && (
          <button
            onClick={clearDone}
            className="ml-auto text-[12px] text-[#9d8570] hover:text-[#c4724a] transition-colors"
          >
            완료 항목 삭제 ({checkedCount})
          </button>
        )}
      </nav>

      <main className="max-w-[600px] mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-[#f5ede0] flex items-center justify-center">
              <ShoppingCart size={36} className="text-[#c4724a]/60" />
            </div>
            <h2 className="text-xl font-bold text-[#3d2b1f]">장보기 목록이 비어있어요</h2>
            <p className="text-[14px] text-[#7d6550]">레시피 페이지에서 재료를 추가해보세요</p>
            <Link href="/" className="text-[14px] text-[#c4724a] font-semibold hover:underline">
              레시피 찾으러 가기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(groups).map(([videoTitle, groupItems]) => (
              <div key={videoTitle}>
                <Link
                  href={`/recipe/${groupItems[0].videoId}`}
                  className="text-[13px] font-bold text-[#7d6550] hover:text-[#c4724a] transition-colors mb-3 block truncate"
                >
                  📺 {videoTitle}
                </Link>
                <div className="flex flex-col gap-2">
                  {groupItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 bg-white border-[1.5px] rounded-xl px-4 py-3 transition-colors ${
                        item.checked ? 'border-[#e8ddd2] opacity-60' : 'border-[#ddd0bc]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggle(item.id)}
                        className="w-4 h-4 accent-[#c4724a] cursor-pointer shrink-0"
                      />
                      <span
                        className={`flex-1 text-[14px] text-[#3d2b1f] break-keep ${
                          item.checked ? 'line-through text-[#9d8570]' : ''
                        }`}
                      >
                        {item.name}
                      </span>
                      {item.amount && (
                        <span className="text-[12px] text-[#a89880] shrink-0">{item.amount}</span>
                      )}
                      <button
                        onClick={() => remove(item.id)}
                        className="text-[#c0b0a0] hover:text-red-400 transition-colors shrink-0"
                        aria-label="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
