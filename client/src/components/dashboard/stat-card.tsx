import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  change: string;
  positive: boolean | null; // null means neutral
  icon: string;
  color: "primary" | "secondary" | "accent" | "success" | "warning" | "danger";
}

export default function StatCard({ 
  title, 
  value, 
  change, 
  positive, 
  icon, 
  color 
}: StatCardProps) {
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary-light bg-opacity-20 text-primary";
      case "secondary":
        return "bg-secondary-light bg-opacity-20 text-secondary";
      case "accent":
        return "bg-accent-light bg-opacity-20 text-accent";
      case "success":
        return "bg-success bg-opacity-20 text-success";
      case "warning":
        return "bg-warning bg-opacity-20 text-warning";
      case "danger":
        return "bg-destructive bg-opacity-20 text-destructive";
      default:
        return "bg-primary-light bg-opacity-20 text-primary";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-neutral-500 text-sm font-medium">{title}</h3>
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", getColorClasses(color))}>
          <i className={icon}></i>
        </div>
      </div>
      <p className="text-2xl font-semibold">{value.toLocaleString()}</p>
      {positive !== null && (
        <p className={cn(
          "text-xs flex items-center mt-1",
          positive ? "text-success" : "text-warning"
        )}>
          <i className={cn("mr-0.5", positive ? "ri-arrow-up-line" : "ri-arrow-down-line")}></i>
          <span>{change}</span>
        </p>
      )}
      {positive === null && (
        <p className="text-xs text-neutral-500 flex items-center mt-1">
          <span>{change}</span>
        </p>
      )}
    </div>
  );
}
