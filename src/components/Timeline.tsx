import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { TimelineEvent } from "@/data/mockData";

interface TimelineProps {
  events: TimelineEvent[];
}

const typeConfig = {
  info: { icon: Info, dotClass: "bg-accent" },
  warning: { icon: AlertTriangle, dotClass: "bg-status-active" },
  success: { icon: CheckCircle2, dotClass: "bg-status-completed" },
  error: { icon: XCircle, dotClass: "bg-status-revision" },
};

const Timeline = ({ events }: TimelineProps) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <h2 className="text-lg font-heading font-bold text-foreground mb-6">Riwayat Aktivitas</h2>
      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
        <div className="space-y-5">
          {events.map((event, i) => {
            const config = typeConfig[event.type];
            return (
              <div key={i} className="relative flex gap-4 pl-6">
                <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-card ${config.dotClass}`} />
                <div>
                  <p className="text-sm text-foreground">{event.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.date} · {event.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
