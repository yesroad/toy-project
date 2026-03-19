export default function HomeHero() {
  return (
    <>
      <div className="flex items-center justify-center gap-2.5 mb-4">
        <div className="w-11 h-11 bg-[#c4724a] rounded-xl flex items-center justify-center text-2xl shadow-md">
          🍳
        </div>
        <h1 className="text-[28px] font-extrabold text-[#3d2b1f] tracking-tight">
          Cook<span className="text-[#c4724a]">Clip</span>
        </h1>
      </div>
      <p className="text-[14px] text-[#7d6550] mb-5 break-keep">
        유튜브 요리 영상을 <span className="text-[#c4724a] font-semibold">clip</span>하고
        <br />
        레시피와 재료를 한 번에 확인하세요
      </p>
    </>
  );
}
