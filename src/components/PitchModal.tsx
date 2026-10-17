import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, Mail, MessageSquare, PhoneCall, Loader2, Building, Globe, MapPin } from 'lucide-react';
import { Lead, PitchResponse } from '../types/radar';
import { generatePitch } from '../services/api';

interface PitchModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({ lead, onClose }) => {
  const [vendorProfile, setVendorProfile] = useState('Proveedor de servicios y soluciones comerciales B2B');
  const [pitchData, setPitchData] = useState<PitchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp' | 'call'>('email');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!lead) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const data = await generatePitch({ lead, vendorProfile });
      setPitchData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-blue-950/40">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-850">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white">Generador de Acercamiento B2B</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Propuesta comercial a medida para <strong className="text-white">{lead.name}</strong> ({lead.category})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Company info strip */}
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold">{lead.name}</span>
            </div>
            <div className="flex items-center gap-3">
              {lead.website && (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                >
                  <Globe className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{lead.website.replace(/^https?:\/\//i, '')}</span>
                </a>
              )}
              {lead.phone && (
                <span className="text-emerald-400 font-medium">{lead.phone}</span>
              )}
            </div>
          </div>

          {/* Vendor profile input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              ¿Qué ofreces a este cliente? (Tu perfil o servicio)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={vendorProfile}
                onChange={(e) => setVendorProfile(e.target.value)}
                placeholder="Ej. Servicios de ciberseguridad para banca, consultoría de procesos, insumos..."
                className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Redactando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generar Guiones</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {pitchData ? (
            <div className="space-y-4 pt-2">
              {/* Channel Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('email')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    activeTab === 'email'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Correo en Frío
                </button>
                <button
                  onClick={() => setActiveTab('whatsapp')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    activeTab === 'whatsapp'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Comercial
                </button>
                <button
                  onClick={() => setActiveTab('call')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    activeTab === 'call'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Guion Telefónico
                </button>
              </div>

              {/* Tab: Email */}
              {activeTab === 'email' && (
                <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1 font-semibold text-[11px]">
                      <span>ASUNTO:</span>
                      <button
                        onClick={() => handleCopy(pitchData.emailSubject, 'subject')}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        {copiedKey === 'subject' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'subject' ? 'Copiado' : 'Copiar asunto'}</span>
                      </button>
                    </div>
                    <div className="p-2.5 bg-slate-800 rounded-lg text-white font-medium border border-slate-700">
                      {pitchData.emailSubject}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1 font-semibold text-[11px]">
                      <span>CUERPO DEL MENSAJE:</span>
                      <button
                        onClick={() => handleCopy(pitchData.emailBody, 'body')}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        {copiedKey === 'body' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'body' ? 'Copiado' : 'Copiar mensaje'}</span>
                      </button>
                    </div>
                    <div className="p-3 bg-slate-800 rounded-lg text-slate-200 whitespace-pre-line border border-slate-700 leading-relaxed font-sans">
                      {pitchData.emailBody}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: WhatsApp */}
              {activeTab === 'whatsapp' && (
                <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1 font-semibold text-[11px]">
                    <span>MENSAJE CORTO PARA WHATSAPP:</span>
                    <button
                      onClick={() => handleCopy(pitchData.whatsappMessage, 'whatsapp')}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      {copiedKey === 'whatsapp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'whatsapp' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-lg text-slate-200 whitespace-pre-line leading-relaxed">
                    {pitchData.whatsappMessage}
                  </div>
                  {lead.phone && (
                    <div className="pt-1">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(pitchData.whatsappMessage)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Abrir chat de WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Call Script */}
              {activeTab === 'call' && (
                <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1 font-semibold text-[11px]">
                    <span>GUION DE LLAMADA (30-45 SEG):</span>
                    <button
                      onClick={() => handleCopy(pitchData.phoneScript, 'call')}
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      {copiedKey === 'call' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'call' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg text-slate-200 whitespace-pre-line border border-slate-700 leading-relaxed font-sans">
                    {pitchData.phoneScript}
                  </div>
                </div>
              )}

              {/* Key selling points */}
              {pitchData.keySellingPoints && pitchData.keySellingPoints.length > 0 && (
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-300 block mb-1.5 text-[11px] uppercase tracking-wider">
                    Argumentos Clave de Venta:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {pitchData.keySellingPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-800/30 border border-slate-800 rounded-xl">
              <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-white">Genera una propuesta comercial personalizada</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Haz clic en "Generar Guiones" para que la IA redacte un correo en frío, un mensaje de WhatsApp y un guion telefónico enfocado en las necesidades de {lead.name}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-850">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
