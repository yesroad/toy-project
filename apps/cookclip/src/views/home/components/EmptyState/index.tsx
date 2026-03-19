const HINT_QUERIES = ['백종원', '1분요리', '쉐프의 테이블', '만개의레시피'];

interface EmptyStateProps {
  onHintClick: (query: string) => void;
}

export default function EmptyState({ onHintClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-28 h-28 rounded-full bg-[#f5ede0] flex items-center justify-center text-5xl">
        👨‍🍳
      </div>
      <h2 className="text-xl font-bold text-[#3d2b1f] break-keep">오늘은 뭐 만들까요?</h2>
      <p className="text-[14px] text-[#7d6550] max-w-[280px] break-keep">
        요리 채널을 검색하면 레시피와 재료를 한 번에 확인할 수 있어요
      </p>
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {HINT_QUERIES.map((q) => (
          <button
            key={q}
            onClick={() => onHintClick(q)}
            className="bg-white border-[1.5px] border-[#ddd0bc] rounded-full px-4 py-1.5 text-[13px]
                       text-[#9e7b5a] font-medium hover:border-[#9e7b5a] hover:bg-[#f5ede0]
                       transition-all cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
