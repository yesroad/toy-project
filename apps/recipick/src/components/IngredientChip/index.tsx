'use client';

interface IngredientChipProps {
  name: string;
  amount: string;
  link?: string;
}

export default function IngredientChip({ name, amount, link }: IngredientChipProps) {
  const href = link ?? `https://www.coupang.com/np/search?q=${encodeURIComponent(name)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center justify-center gap-1.5
                 bg-[#f5ede0] border-[1.5px] border-[#ddd0bc] rounded-full px-3.5 py-2
                 text-[13px] font-medium text-[#3d2b1f]
                 hover:bg-[#c4724a] hover:border-[#c4724a] hover:text-white
                 hover:-translate-y-px hover:shadow-sm
                 transition-all duration-150 no-underline"
    >
      <span className="font-semibold">{name}</span>
      <span className="text-[12px] text-[#7d6550] group-hover:text-white/80 transition-colors">
        {amount}
      </span>
      <span className="text-[13px] ml-0.5 opacity-45 group-hover:opacity-90 transition-opacity">
        🛒
      </span>
    </a>
  );
}
