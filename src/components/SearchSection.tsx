import { Search } from "lucide-react";
import { useState } from "react";

interface SearchSectionProps {
  onSearch: (query: string) => void;
}

const SearchSection = ({ onSearch }: SearchSectionProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <section className="bg-gradient-to-br from-primary to-accent py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-status-completed animate-pulse-soft" />
          <span className="text-primary-foreground/80 text-sm font-medium tracking-wide uppercase">
            Sistem Pelacakan Dokumen
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-3">
          Tracking Progress PB UMKU
        </h1>
        <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
          Pantau status pengajuan Penempatan Pekerja Migran Indonesia untuk Kepentingan Perusahaan Sendiri melalui sistem OSS.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Masukkan Nomor Permohonan OSS"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-card text-card-foreground placeholder:text-muted-foreground border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-card text-primary font-semibold rounded-lg shadow-lg hover:bg-secondary transition-colors text-sm whitespace-nowrap"
          >
            Cek Status
          </button>
        </form>
      </div>
    </section>
  );
};

export default SearchSection;
