import { Progress } from "@workspace/ui/components/Progress";

const Summary = () => {
  return (
    <div className="flex justify-between items-center rounded-md shadow-sm p-4">
      <div>
        <strong>식단 요약</strong>
        <p className="text-sm leading-none font-medium text-gray-500 mt-1">아침 520 아침 520 아침 520</p>
      </div>
      <div>
        <span className="text-sm leading-none font-medium">목표달성</span>
        <Progress value={33} />
      </div>
    </div>
  )
}

export default Summary;