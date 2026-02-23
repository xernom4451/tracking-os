import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubmissions } from "@/contexts/SubmissionContext";
import { FileText, Search, CheckCircle2, Clock, LogOut } from "lucide-react";

const statusLabel: Record<string, { text: string; className: string }> = {
  completed: { text: "Selesai", className: "bg-status-completed-bg text-status-completed" },
  active: { text: "Sedang Diproses", className: "bg-status-active-bg text-status-active" },
  revision: { text: "Perlu Perbaikan", className: "bg-status-revision-bg text-status-revision" },
  pending: { text: "Pending", className: "bg-status-pending-bg text-status-pending" },
};

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { submissions } = useSubmissions();
  const navigate = useNavigate();

  const stats = {
    total: submissions.length,
    verifikasi: submissions.filter((s) => s.stages.some((st) => st.label === "Verifikasi Dokumen" && st.status === "active")).length,
    peninjauan: submissions.filter((s) => s.stages.some((st) => st.label === "Peninjauan" && st.status === "active")).length,
    terbit: submissions.filter((s) => s.currentStatusType === "completed").length,
  };

  const statCards = [
    { label: "Total Permohonan", value: stats.total, icon: FileText, color: "text-accent" },
    { label: "Dalam Verifikasi Dokumen", value: stats.verifikasi, icon: Search, color: "text-status-active" },
    { label: "Dalam Peninjauan", value: stats.peninjauan, icon: Clock, color: "text-accent" },
    { label: "Izin Terbit", value: stats.terbit, icon: CheckCircle2, color: "text-status-completed" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-sm">PB</span>
            </div>
            <span className="font-heading font-semibold text-foreground text-sm">Sistem Tracking PB UMKU</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Halaman Tracking
            </button>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-status-revision hover:bg-status-revision-bg rounded-lg transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-8">Dashboard Admin – Tracking PB UMKU</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-card rounded-xl border border-border shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-heading font-bold text-foreground">Daftar Permohonan</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nomor Permohonan OSS</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama LPK</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tahap Saat Ini</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Terakhir Diperbarui</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const st = statusLabel[s.currentStatusType] || statusLabel.pending;
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{s.submissionNumber}</td>
                      <td className="px-6 py-4 text-foreground">{s.organizationName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{s.currentStatus}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.className}`}>
                          {st.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{s.lastUpdated}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/admin/kelola/${s.id}`)}
                          className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Kelola
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
