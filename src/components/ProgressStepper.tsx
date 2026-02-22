import { Check, AlertTriangle } from "lucide-react";
import type { Stage } from "@/data/mockData";

interface ProgressStepperProps {
  stages: Stage[];
}

const ProgressStepper = ({ stages }: ProgressStepperProps) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <h2 className="text-lg font-heading font-bold text-foreground mb-6">Tahapan Proses</h2>
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-10" />

        {stages.map((stage, i) => (
          <div key={i} className="relative flex flex-col items-center flex-1">
            <StepIcon status={stage.status} />
            <p className={`mt-3 text-xs font-medium text-center px-1 ${
              stage.status === "completed" ? "text-status-completed" :
              stage.status === "active" ? "text-status-active" :
              stage.status === "revision" ? "text-status-revision" :
              "text-status-pending"
            }`}>
              {stage.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const StepIcon = ({ status }: { status: Stage["status"] }) => {
  const base = "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all";

  if (status === "completed")
    return <div className={`${base} bg-status-completed border-status-completed`}><Check className="w-4 h-4 text-primary-foreground" /></div>;
  if (status === "active")
    return <div className={`${base} bg-status-active-bg border-status-active animate-pulse-soft`}><span className="w-3 h-3 rounded-full bg-status-active" /></div>;
  if (status === "revision")
    return <div className={`${base} bg-status-revision-bg border-status-revision`}><AlertTriangle className="w-4 h-4 text-status-revision" /></div>;
  return <div className={`${base} bg-status-pending-bg border-status-pending`}><span className="w-3 h-3 rounded-full bg-status-pending/40" /></div>;
};

export default ProgressStepper;
