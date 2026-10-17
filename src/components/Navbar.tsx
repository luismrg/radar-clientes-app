import React from 'react';
import { Radar, MapPin, Sparkles, Download, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  totalLeads: number;
  onExportCsv: () => void;
  activeQuery?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ totalLeads, onExportCsv, activeQuery }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25">
            <Radar className="w-5 h-5 text-white animate-spin-slow" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                Radar Clientes
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <MapPin className="w-3 h-3" /> Google Maps Places
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Prospección comercial B2B con datos de fichas públicas de Google Maps
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {totalLeads > 0 && (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{totalLeads} prospectos cargados</span>
              </div>
              <button
                onClick={onExportCsv}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                title="Descargar lista completa en formato CSV/Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </>
          )}

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-[11px]">En vivo</span>
          </div>
        </div>
      </div>
    </header>
  );
};
