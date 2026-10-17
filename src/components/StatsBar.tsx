import React from 'react';
import { Lead, GroundingSource } from '../types/radar';
import { Building2, Globe, Phone, Star, ShieldCheck, ExternalLink } from 'lucide-react';

interface StatsBarProps {
  leads: Lead[];
  groundingSources: GroundingSource[];
  location: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ leads, groundingSources, location }) => {
  if (leads.length === 0) return null;

  const total = leads.length;
  const withWebsite = leads.filter((l) => l.hasWebsite).length;
  const withPhone = leads.filter((l) => Boolean(l.phone)).length;
  const ratedLeads = leads.filter((lead) => lead.rating > 0);
  const avgRating = ratedLeads.length > 0
    ? (ratedLeads.reduce((acc, lead) => acc + lead.rating, 0) / ratedLeads.length).toFixed(1)
    : null;

  const webPct = Math.round((withWebsite / total) * 100);
  const phonePct = Math.round((withPhone / total) * 100);

  return (
    <div className="space-y-4 mb-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Clientes Identificados</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{total}</div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            En {location}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Webs en ficha de Maps</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {withWebsite} <span className="text-xs font-medium text-slate-400">({webPct}%)</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Publicados en Google Maps
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Con Teléfono Directo</span>
            <Phone className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {withPhone} <span className="text-xs font-medium text-slate-400">({phonePct}%)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Listos para contacto comercial
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Rating Promedio</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-1">
            {avgRating ?? '—'} {avgRating && <span className="text-xs text-slate-400">/ 5.0</span>}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Evaluaciones Google Maps
          </p>
        </div>
      </div>

      {/* Grounding Attribution Banner */}
      {groundingSources && groundingSources.length > 0 && (
        <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              Resultados obtenidos en tiempo real de <strong>Google Maps Places</strong> ({groundingSources.length} fichas de Maps).
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {groundingSources.slice(0, 3).map((src, i) => (
              <a
                key={i}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-900/40 text-blue-300 hover:text-white border border-blue-800/40"
              >
                <span className="truncate max-w-[120px]">{src.title}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
