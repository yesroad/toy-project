import { CardDescription, CardTitle } from "@workspace/ui/components/card";
import classNames from "classnames";

interface TodayCardProps {
  title: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}

const TodayCard = ({ title, label, icon, color }: TodayCardProps) => {
  return (
    <div className={classNames(['flex', 'justify-between', 'items-center', 'p-4', 'w-45', 'rounded-md', 'shadow-sm', color])}>
      <div>
        <CardDescription className="text-white">
          {title}
        </CardDescription>
        <CardTitle className="mt-1 text-white">{label}</CardTitle>
      </div>
      {icon}
    </div >
  )
}

export default TodayCard;