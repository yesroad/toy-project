interface RecipeStepsProps {
  steps: string[];
}

export default function RecipeSteps({ steps }: RecipeStepsProps) {
  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, index) => (
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
          </div>
        </li>
      ))}
    </ol>
  );
}
