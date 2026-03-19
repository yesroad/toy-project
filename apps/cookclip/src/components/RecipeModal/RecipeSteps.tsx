interface StepDetail {
  description: string;
  ingredients?: string[];
  duration?: number;
}

interface RecipeStepsProps {
  steps: string[];
  stepDetails?: StepDetail[];
}

export default function RecipeSteps({ steps, stepDetails }: RecipeStepsProps) {
  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, index) => {
        const detail = stepDetails?.[index];
        return (
          <li key={index} className="flex gap-4 items-start">
            <div className="shrink-0 flex flex-col items-center">
              <span className="text-[11px] font-black text-[#c4724a]/50 leading-none tracking-widest uppercase">
                STEP
              </span>
              <span className="text-[28px] font-black text-[#c4724a]/20 leading-none">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="flex-1 bg-[#fdf8f4] border border-[#ede3d8] rounded-xl px-4 py-3 mt-1">
              <p className="text-[14px] text-[#3d2b1f] leading-relaxed break-keep">{step}</p>
              {/* 단계별 재료 칩 (stepDetails가 있을 때만) */}
              {detail?.ingredients && detail.ingredients.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {detail.ingredients.map((name, i) => (
                    <span
                      key={i}
                      className="text-[11px] text-[#9e7b5a] bg-[#f5ede0] border border-[#ddd0bc] px-2 py-0.5 rounded-full"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
              {/* 소요 시간 */}
              {!!detail?.duration && (
                <p className="text-[11px] text-[#a89880] mt-2">⏱ {detail.duration}초</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
