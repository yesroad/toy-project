import { Link2, Sparkles, UtensilsCrossed, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    icon: Link2,
    label: 'URL 붙여넣기',
    desc: '유튜브 영상 링크만',
  },
  {
    icon: Sparkles,
    label: 'AI 자동 분석',
    desc: '재료·조리법 추출',
  },
  {
    icon: UtensilsCrossed,
    label: '레시피 확인',
    desc: '바로 요리 시작',
  },
] as const;

export default function HomeHero() {
  return (
    <div className="mb-6">
      {/* 로고 + 브랜드 */}
      <div className="flex items-center justify-center gap-2.5 mb-3">
        <div className="w-11 h-11 bg-[#c4724a] rounded-xl flex items-center justify-center text-2xl shadow-md">
          🍳
        </div>
        <h1 className="text-[28px] font-extrabold text-[#3d2b1f] tracking-tight">
          Cook<span className="text-[#c4724a]">Clip</span>
        </h1>
      </div>

      {/* 가치 제안 */}
      <p className="text-[15px] font-semibold text-[#3d2b1f] text-center mb-1 break-keep">
        유튜브 URL 하나로 요리 레시피를 자동 추출
      </p>
      <p className="text-[13px] text-[#7d6550] text-center mb-5 break-keep">
        자막을 AI가 분석해 재료와 조리법을 정리해 드려요
      </p>

      {/* 3단계 흐름 */}
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex items-center gap-1 sm:gap-2">
              <div className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-[#f5ede0] min-w-[80px] sm:min-w-[96px]">
                <div className="w-8 h-8 rounded-full bg-[#c4724a]/10 flex items-center justify-center">
                  <Icon size={16} className="text-[#c4724a]" />
                </div>
                <span className="text-[11px] font-bold text-[#3d2b1f] text-center leading-tight break-keep">
                  {step.label}
                </span>
                <span className="text-[10px] text-[#9d8570] text-center leading-tight break-keep hidden sm:block">
                  {step.desc}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight size={14} className="text-[#c4724a]/50 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
