import { Check } from "lucide-react";
import type { Stage, StageStatus } from "@/data/mockData";

interface ProgressStepperProps {
  stages: Stage[];
  selectedIndex?: number;
  onStageClick?: (index: number) => void;
}

const ProgressStepper = ({ stages, selectedIndex, onStageClick }: ProgressStepperProps) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <h2 className="text-lg font-heading font-bold text-foreground mb-6">Tahapan Proses</h2>
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-10" />
        {stages.map((stage, i) => {
          const clickable = stage.status !== "locked";
          const isSelected = selectedIndex === i;
          return (
            <button
              key={i}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStageClick?.(i)}
              className={`relative flex flex-col items-center flex-1 bg-transparent border-0 p-0 ${clickable ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <StepIcon status={stage.status} selected={isSelected} />
              <p className={`mt-3 text-xs font-medium text-center px-1 ${
                stage.status === "completed" ? "text-status-completed" :
                stage.status === "active" ? "text-status-active" :
                "text-muted-foreground"
              }`}>
                {stage.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const StepIcon = ({ status, selected }: { status: StageStatus; selected?: boolean }) => {
  const base = "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all";
  const ring = selected ? "ring-2 ring-offset-2 ring-primary" : "";

  if (status === "completed")
    return <div className={`${base} ${ring} bg-status-completed border-status-completed`}><Check className="w-4 h-4 text-primary-foreground" /></div>;
  if (status === "active")
    return <div className={`${base} ${ring} bg-status-active-bg border-status-active`}><span className="w-3 h-3 rounded-full bg-status-active" /></div>;
  return <div className={`${base} bg-status-pending-bg border-status-pending`}><span className="w-3 h-3 rounded-full bg-status-pending/40" /></div>;
};

export default ProgressStepper;
