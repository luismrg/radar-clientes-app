import React, { useState } from 'react';
import { 
  Globe, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Star, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  Building2,
  Clock,
  MessageSquareText,
  Search,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Lead, LeadStatus } from '../types/radar';
import { checkUrlReachability } from '../services/api';

interface LeadCardProps {
  lead: Lead;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onOpenPitch: (lead: Lead) => void;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; bg: string; text: string; border: string }> = {
  nuevo: { label: 'Nuevo Lead', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  contactado: { label: 'Contactado', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  en_negociacion: { label: 'En Negociación', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  cerrado: { label: 'Ganado / Cliente', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  descartado: { label: 'Descartado', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onStatusChange, onOpenPitch }) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [urlStatus, setUrlStatus] = useState<'idle' | 'checking' | 'active' | 'unreachable'>('idle');
  const [statusCode, setStatusCode] = useState<number | undefined>();

  const handleCopyPhone = () => {
    if (!lead.phone) return;
    navigator.clipboard.writeText(lead.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleTestUrl = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!lead.website) return;
    setUrlStatus('checking');
    const res = await checkUrlReachability(lead.website);
    setStatusCode(res.status);
    if (res.reachable) {
      setUrlStatus('active');
    } else {
      setUrlStatus('unreachable');
    }
  };

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${lead.name} ${lead.address} sitio web oficial`
  )}`;

  const currentStatus = STATUS_CONFIG[lead.status] || STATUS_CONFIG.nuevo;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 shadow-lg shadow-slate-950/20 flex flex-col justify-between group">
      <div>
        {/* Header: Category & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              <Building2 className="w-3 h-3 text-blue-400" />
              {lead.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> Google Maps
            </span>
          </div>

          {/* Status selector */}
          <div className="relative inline-block">
            <select
              value={lead.status}
              onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border appearance-none pr-6 cursor-pointer focus:outline-none ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
            >
              <option value="nuevo" className="bg-slate-900 text-slate-200">Nuevo Lead</option>
              <option value="contactado" className="bg-slate-900 text-slate-200">Contactado</option>
              <option value="en_negociacion" className="bg-slate-900 text-slate-200">En Negociación</option>
              <option value="cerrado" className="bg-slate-900 text-slate-200">Ganado / Cliente</option>
              <option value="descartado" className="bg-slate-900 text-slate-200">Descartado</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-2 pointer-events-none opacity-60" />
          </div>
        </div>

        {/* Name and Rating */}
        <div className="mb-3">
          <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
            {lead.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <div className="flex items-center text-amber-400 gap-1 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{lead.rating > 0 ? lead.rating.toFixed(1) : 'Sin rating'}</span>
            </div>
            {lead.rating > 0 && (
              <>
                <span>•</span>
                <span>{lead.reviewsCount} reseñas en Google</span>
              </>
            )}
            {lead.schedule && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" /> {lead.schedule}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-xs text-slate-300 mb-4 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{lead.address}</span>
        </div>

        {/* Website & Online Verification Section */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            PÁGINA WEB
          </label>
          {lead.website ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                <a
                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs font-semibold truncate max-w-[70%]"
                  title={`Abrir ${lead.website} en nueva pestaña`}
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{lead.website.replace(/^https?:\/\//i, '')}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>

                {/* Real-time check button */}
                <button
                  onClick={handleTestUrl}
                  disabled={urlStatus === 'checking'}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                  title="Verificar que el servidor web responda sin error 404"
                >
                  {urlStatus === 'checking' && 'Comprobando...'}
                  {urlStatus === 'active' && <span className="text-emerald-400 font-bold">✓ Activo ({statusCode || 200})</span>}
                  {urlStatus === 'unreachable' && <span className="text-amber-400">{statusCode ? `Error HTTP ${statusCode}` : 'Sin respuesta directa'}</span>}
                  {urlStatus === 'idle' && 'Verificar'}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Sitio web indicado en Google Maps</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 py-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400/90 shrink-0" />
                  Sin web en ficha de Maps
                </span>
                <a
                  href={googleSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-300 text-[11px] font-medium transition-colors cursor-pointer underline"
                >
                  <Search className="w-3 h-3" />
                  Buscar en Google
                </a>
              </div>
              {lead.socialUrl && (
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Presencia en redes:</span>
                  <a
                    href={lead.socialUrl.startsWith('http') ? lead.socialUrl : `https://${lead.socialUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-pink-400 hover:text-pink-300 font-medium truncate"
                  >
                    <span className="truncate">{lead.socialUrl.replace(/^https?:\/\//i, '')}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Phone Section */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Teléfono de Contacto
          </label>
          {lead.phone ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-2 text-slate-200 hover:text-emerald-400 font-medium"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lead.phone}</span>
              </a>
              <button
                onClick={handleCopyPhone}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer transition-colors"
                title="Copiar teléfono"
              >
                {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-400 italic">
              Teléfono no listado públicamente
            </div>
          )}
        </div>

        {/* Real Google Maps reviews snippet */}
        {lead.googleMapsReviewSnippets && lead.googleMapsReviewSnippets.length > 0 && (
          <div className="mb-4 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] mb-1">
              <MessageSquareText className="w-3.5 h-3.5 text-blue-400" /> Opinión destacada en Google Maps:
            </div>
            <p className="italic text-slate-300 line-clamp-2">"{lead.googleMapsReviewSnippets[0]}"</p>
          </div>
        )}

        {/* B2B Opportunity & Suggested Services */}
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-blue-950/30 to-indigo-950/20 border border-blue-900/30">
          <div className="flex items-center gap-1.5 text-blue-300 font-semibold text-xs mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Potencial Comercial B2B:</span>
          </div>
          <p className="text-xs text-slate-300 mb-2 leading-relaxed">
            {lead.leadAnalysis}
          </p>
          <div className="flex flex-wrap gap-1">
            {lead.suggestedServices.map((service, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-900/40 border border-blue-700/40 text-blue-200"
              >
                + {service}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <a
          href={lead.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          title="Ver ficha oficial en Google Maps"
        >
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>Ver en Maps</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        <button
          onClick={() => onOpenPitch(lead)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Propuesta B2B</span>
        </button>
      </div>
    </div>
  );
};
