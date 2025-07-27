import { Logo } from "@/components";
import { CardDescription, CardTitle } from "@workspace/ui/components/card";

const LogoBlock = () => {
  return (
    <div className="w-full text-center mb-[50px]">
      <Logo />
      <CardTitle className="mt-[10px]">Fit Track</CardTitle>
      <CardDescription className="mt-[5px]">건강한 습관, 더 나은 삶</CardDescription>
    </div>
  )
}

export default LogoBlock;