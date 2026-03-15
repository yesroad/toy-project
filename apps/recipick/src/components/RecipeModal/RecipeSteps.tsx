interface RecipeStepsProps {
  steps: string[];
}

export default function RecipeSteps({ steps }: RecipeStepsProps) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <li key={index} className="flex gap-3.5 items-start">
          <div className="w-7 h-7 rounded-full bg-[#9e7b5a] text-white text-[13px] font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </div>
          <p className="text-[14px] text-[#3d2b1f] leading-relaxed pt-0.5 break-keep">{step}</p>
        </li>
      ))}
    </ol>
  );
}
