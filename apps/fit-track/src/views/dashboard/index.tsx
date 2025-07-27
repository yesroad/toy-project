"use client"

import { Header } from "@/components";
import { Summary, TodayCard } from "./components";
import { LiaWeightSolid } from "react-icons/lia";
import { MdOutlineFastfood } from "react-icons/md";
import { ChartConfig, ChartContainer } from "@workspace/ui/components/chart";

import { Line, LineChart } from "recharts"
const data = [
  {
    title: '오늘 체중',
    label: '62.7kg',
    icon: <LiaWeightSolid />,
    color: 'bg-(--chart-1)'
  },
  {
    title: '섭취 칼로리',
    label: '1,650',
    icon: <MdOutlineFastfood />,
    color: 'bg-(--chart-2)'
  },
  {
    title: '소모 칼로리',
    label: '300',
    icon: <LiaWeightSolid />,
    color: 'bg-(--chart-3)'
  }, {
    title: '걸음수',
    label: '2000',
    icon: <LiaWeightSolid />,
    color: 'bg-(--chart-4)'
  },
]


const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig


const Dashboard = () => {
  return (
    <>
      <Header title='안녕하세요! 👋' description="오늘도 건강한 하루 보내세요" />
      <div className="flex flex-wrap gap-y-2 justify-between">
        {data.map((item, idx) => <TodayCard key={idx} {...item} />)}
      </div>
      <div className="mt-5">
        <Summary />
        <Summary />
      </div>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="desktop" stroke="#8884d8" />
          <Line type="monotone" dataKey="mobile" stroke="#82ca9d" />
        </LineChart>
      </ChartContainer>

    </>
  )
}

export default Dashboard;