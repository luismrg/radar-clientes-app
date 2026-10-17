import React, { useState } from 'react';
import { Lead, LeadStatus } from '../types/radar';
import { 
  Globe, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Star, 
  Sparkles, 
  Search, 
  Ban, 
  Instagram, 
  CheckSquare, 
  Square,
  Download,
  CheckCircle2
} from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  onStatusChange: (id: string, status: LeadStatus) => void;
  onOpenPitch: (lead: Lead) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onExportSelected?: () => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({ 
  leads, 
  onStatusChange, 
  onOpenPitch,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onExportSelected
}) => {
  const allSelected = leads.length > 0 && selectedIds.length === leads.length;

  return (
    <div className="space-y-3">
      {/* Selection toolbar if any selected */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-850 border border-blue-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs animate-fade-in shadow-md">
          <div className="flex items-center gap-2 text-slate-200">
            <span className="font-bold text-blue-400">{selectedIds.length}</span>
            <span>negocios seleccionados de {leads.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {onExportSelected && (
              <button
                onClick={onExportSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar seleccionados</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-slate-950/40">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] table-fixed text-left text-xs text-slate-300 lg:min-w-full">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[19%]" />
              <col className="w-[21%]" />
              <col className="w-[18%]" />
              <col className="w-[9%]" />
              <col className="w-[14%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="bg-slate-800/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-2 text-center lg:px-3">
                  {onSelectAll && (
                    <button
                      type="button"
                      onClick={onSelectAll}
                      className="text-slate-400 hover:text-white cursor-pointer"
                      title={allSelected ? 'Desmarcar todos' : 'Seleccionar todos'}
                    >
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  )}
                </th>
                <th className="py-3.5 px-2 lg:px-3">Negocio / Empresa</th>
                <th className="py-3.5 px-2 lg:px-3">Teléfono & Dirección</th>
                <th className="py-3.5 px-2 lg:px-3">PÁGINA WEB</th>
                <th className="py-3.5 px-2 lg:px-3">Rating</th>
                <th className="py-3.5 px-2 lg:px-3">Estado</th>
                <th className="sticky right-0 z-20 whitespace-nowrap bg-slate-800 py-3.5 px-2 text-right lg:px-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {leads.map((lead) => {
                const isSelected = selectedIds.includes(lead.id);
                const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
                  `${lead.name} ${lead.address} sitio web oficial`
                )}`;

                return (
                  <tr 
                    key={lead.id} 
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isSelected ? 'bg-blue-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-2 text-center lg:px-3">
                      {onToggleSelect && (
                        <button
                          type="button"
                          onClick={() => onToggleSelect(lead.id)}
                          className="cursor-pointer text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>
                      )}
                    </td>

                    {/* Name & Category (matches screenshot layout) */}
                    <td className="py-3.5 px-2 lg:px-3">
                      <div className="break-words font-bold text-white text-sm hover:text-blue-300 transition-colors">
                        {lead.name}
                      </div>
                      <div className="mt-0.5 break-words text-[11px] text-slate-400">
                        {lead.category}
                      </div>
                    </td>

                    {/* Phone & Address (with green phone icon as in screenshot) */}
                    <td className="py-3.5 px-2 lg:px-3">
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium text-xs mb-1"
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{lead.phone}</span>
                        </a>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic mb-1">
                          Sin teléfono registrado
                        </div>
                      )}
                      <div className="flex min-w-0 items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">{lead.address}</span>
                      </div>
                    </td>

                    {/* Website links only come from the Google Maps place record. */}
                    <td className="py-3.5 px-2 lg:px-3">
                      {lead.website ? (
                        <div className="min-w-0">
                          <a
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium text-xs group py-0.5 px-1.5 rounded-md hover:bg-blue-950/30 transition-colors"
                            title={`Abrir ${lead.website} en nueva pestaña`}
                          >
                            <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="min-w-0 truncate">
                              {lead.website.replace(/^https?:\/\/(www\.)?/i, '')}
                            </span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
                            <Ban className="w-3.5 h-3.5 text-red-400/90 shrink-0" />
                            Sin web en ficha de Maps
                          </span>
                          {lead.socialUrl && (
                            <a
                              href={lead.socialUrl.startsWith('http') ? lead.socialUrl : `https://${lead.socialUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-pink-400 hover:text-pink-300 underline"
                              title="Redes sociales"
                            >
                              (Redes)
                            </a>
                          )}
                          <a
                            href={googleSearchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-slate-400 hover:text-blue-300 underline ml-auto"
                            title="Buscar en Google"
                          >
                            buscar
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-2 lg:px-3">
                      {lead.rating > 0 ? (
                        <div className="flex items-center gap-1 whitespace-nowrap text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{lead.rating.toFixed(1)}</span>
                          <span className="text-slate-500 text-[10px] font-normal">
                            ({lead.reviewsCount})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Sin rating</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-2 lg:px-3">
                      <select
                        value={lead.status}
                        onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                        className="w-full max-w-full text-[11px] font-medium bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer lg:px-2"
                      >
                        <option value="nuevo">Nuevo</option>
                        <option value="contactado">Contactado</option>
                        <option value="en_negociacion">Negociación</option>
                        <option value="cerrado">Ganado</option>
                        <option value="descartado">Descartado</option>
                      </select>
                    </td>

                    {/* Action buttons */}
                    <td className={`sticky right-0 z-10 min-w-[112px] whitespace-nowrap py-3.5 px-2 text-right lg:min-w-[128px] lg:px-3 ${isSelected ? 'bg-blue-950/20' : 'bg-slate-900'}`}>
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={lead.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-lg bg-slate-800 p-1.5 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                          title="Abrir en Google Maps"
                        >
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        </a>
                        <button
                          onClick={() => onOpenPitch(lead)}
                          aria-label={`Generar propuesta para ${lead.name}`}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-2 py-1 text-white font-medium text-[11px] cursor-pointer transition-colors shadow-xs hover:bg-blue-500"
                          title="Generar propuesta personalizada de prospección B2B"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span className="hidden 2xl:inline">Propuesta</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
