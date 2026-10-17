import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SearchControls } from './components/SearchControls';
import { LeadCard } from './components/LeadCard';
import { LeadTable } from './components/LeadTable';
import { StatsBar } from './components/StatsBar';
import { PitchModal } from './components/PitchModal';
import { Lead, LeadStatus, GroundingSource } from './types/radar';
import { searchPlaces } from './services/api';
import { 
  Radar, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown,
  Loader2
} from 'lucide-react';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [currentQuery, setCurrentQuery] = useState('bancos comerciales');
  const [currentLocation, setCurrentLocation] = useState('Santo Domingo');
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();

  // Filters & View state
  const [filterOption, setFilterOption] = useState<'all' | 'hasWebsite' | 'withoutWebsite' | 'hasPhone' | 'highRating'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedLeadForPitch, setSelectedLeadForPitch] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast feedback
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Primary fresh search (Page 1)
  const handleSearch = useCallback(async (params: {
    query: string;
    location: string;
    coords?: { latitude: number; longitude: number };
  }) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuery(params.query);
    setCurrentLocation(params.location);
    setCurrentCoords(params.coords);
    setCurrentPage(1);
    setNextPageToken(undefined);
    setSelectedIds([]);
    setLeads([]);
    setGroundingSources([]);
    setHasMore(false);

    try {
      const data = await searchPlaces({
        query: params.query,
        location: params.location,
        page: 1,
        limit: 20,
        coords: params.coords,
      });

      setLeads(data.leads);
      setGroundingSources(data.groundingSources);
      setHasMore(data.hasMore);
      setNextPageToken(data.nextPageToken);
      showToast(`¡Cargados primeros ${data.leads.length} negocios en ${params.location}!`);
    } catch (err: unknown) {
      console.error('Search failed:', err);
      setError(err instanceof Error ? err.message : 'Error al conectar con el servicio de búsqueda de clientes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // "Cargar más resultados (+20 negocios)"
  const handleLoadMore = async () => {
    if (isLoadingMore || isLoadingAll || !hasMore || leads.length >= 60) return;
    setIsLoadingMore(true);
    setError(null);

    const nextPage = currentPage + 1;
    try {
      const data = await searchPlaces({
        query: currentQuery,
        location: currentLocation,
        page: nextPage,
        limit: 20,
        pageToken: nextPageToken,
        coords: currentCoords,
      });

      // Filter out any duplicates if name already in leads
      const existingNameSet = new Set(leads.map((lead) => lead.name.toLowerCase()));
      const newItems = data.leads.filter((lead) => {
        const key = lead.name.toLowerCase();
        if (existingNameSet.has(key)) return false;
        existingNameSet.add(key);
        return true;
      });

      const updatedLeads = [...leads, ...newItems];
      setLeads(updatedLeads);
      setCurrentPage(nextPage);
      setNextPageToken(data.nextPageToken);
      setHasMore(data.hasMore && updatedLeads.length < 60);

      // Merge grounding sources
      if (data.groundingSources && data.groundingSources.length > 0) {
        setGroundingSources((prev) => [...prev, ...data.groundingSources]);
      }

      const totalLoaded = updatedLeads.length;
      if (totalLoaded >= 60 || !data.hasMore) {
        setHasMore(false);
        showToast(`No hay más resultados para esta búsqueda. Total: ${totalLoaded}.`);
      } else {
        showToast(`¡Cargados +${data.leads.length} negocios! Total: ${totalLoaded}`);
      }
    } catch (err: unknown) {
      console.error('Failed to load more leads:', err);
      setError(err instanceof Error ? err.message : 'No se pudieron cargar más resultados en este momento.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // "Cargar todos los disponibles (hasta 60)"
  const handleLoadAll = async () => {
    if (isLoadingAll || isLoadingMore || !hasMore || leads.length >= 60) return;
    setIsLoadingAll(true);
    setError(null);

    let currentList = [...leads];
    let pageToFetch = currentPage + 1;
    let pageToken = nextPageToken;
    let hasNextPage: boolean = hasMore;

    try {
      while (currentList.length < 60 && hasNextPage) {
        const data = await searchPlaces({
          query: currentQuery,
          location: currentLocation,
          page: pageToFetch,
          limit: 20,
          pageToken,
          coords: currentCoords,
        });

        pageToken = data.nextPageToken;
        hasNextPage = data.hasMore;
        if (!data.leads || data.leads.length === 0) {
          hasNextPage = false;
          pageToken = undefined;
          break;
        }

        const existingSet = new Set(currentList.map((l) => l.name.toLowerCase()));
        const newBatch = data.leads.filter((l) => !existingSet.has(l.name.toLowerCase()));
        
        currentList = [...currentList, ...newBatch];
        if (data.groundingSources) {
          setGroundingSources((prev) => [...prev, ...data.groundingSources]);
        }

        pageToFetch++;
      }

      setLeads(currentList);
      setCurrentPage(pageToFetch - 1);
      setNextPageToken(pageToken);
      setHasMore(hasNextPage && currentList.length < 60);
      showToast(`¡Todos los disponibles cargados! Total: ${currentList.length} negocios.`);
    } catch (err: unknown) {
      console.error('Error loading all leads:', err);
      setLeads(currentList);
      setCurrentPage(pageToFetch - 1);
      setNextPageToken(pageToken);
      setHasMore(hasNextPage);
      setError(err instanceof Error ? err.message : 'No se pudieron cargar todos los resultados.');
    } finally {
      setIsLoadingAll(false);
    }
  };

  // Run initial search on mount (bancos comerciales en Santo Domingo)
  useEffect(() => {
    handleSearch({
      query: 'bancos comerciales',
      location: 'Santo Domingo',
    });
  }, [handleSearch]);

  // Lead status update
  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
    );
    showToast('Estado del lead actualizado');
  };

  // Checkbox selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  // Filter leads based on selected filter
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filterOption === 'hasWebsite') return lead.hasWebsite;
      if (filterOption === 'withoutWebsite') return !lead.hasWebsite;
      if (filterOption === 'hasPhone') return Boolean(lead.phone);
      if (filterOption === 'highRating') return lead.rating >= 4.0;
      return true;
    });
  }, [leads, filterOption]);

  // Export to CSV with UTF-8 BOM
  const handleExportCsv = (onlySelected: boolean = false) => {
    const targetLeads = onlySelected
      ? filteredLeads.filter((l) => selectedIds.includes(l.id))
      : filteredLeads;

    if (targetLeads.length === 0) {
      showToast('No hay prospectos para exportar.');
      return;
    }

    const headers = [
      'Empresa',
      'Categoría',
      'Dirección',
      'Teléfono',
      'Sitio Web Oficial',
      'Red Social',
      'Ficha Google Maps',
      'Rating',
      'Reseñas',
      'Horario',
      'Diagnóstico B2B',
      'Servicios Sugeridos',
      'Estado Comercial',
    ];

    const rows = targetLeads.map((l) => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.category || '').replace(/"/g, '""')}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.website || '').replace(/"/g, '""')}"`,
      `"${(l.socialUrl || '').replace(/"/g, '""')}"`,
      `"${(l.mapsUrl || '').replace(/"/g, '""')}"`,
      l.rating,
      l.reviewsCount,
      `"${(l.schedule || '').replace(/"/g, '""')}"`,
      `"${(l.leadAnalysis || '').replace(/"/g, '""')}"`,
      `"${(l.suggestedServices || []).join('; ').replace(/"/g, '""')}"`,
      `"${l.status}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `radar-clientes-${currentQuery.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Archivo CSV exportado con ${targetLeads.length} prospectos`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <Navbar
        totalLeads={leads.length}
        onExportCsv={() => handleExportCsv(false)}
        activeQuery={currentQuery}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {/* Search & Category Controls */}
        <SearchControls
          onSearch={handleSearch}
          isLoading={isLoading || isLoadingMore || isLoadingAll}
          filterOption={filterOption}
          onFilterChange={setFilterOption}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFiltered={filteredLeads.length}
          initialQuery={currentQuery}
          initialLocation={currentLocation}
        />

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Error en la búsqueda</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => handleSearch({ query: currentQuery, location: currentLocation, coords: currentCoords })}
              className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Stats summary bar */}
        <StatsBar
          leads={leads}
          groundingSources={groundingSources}
          location={currentLocation}
        />

        {/* Content: Cards or Table */}
        {isLoading && leads.length === 0 ? (
          <div className="py-20 text-center">
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-4 animate-pulse">
              <Radar className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-white">Explorando Google Maps...</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Consultando negocios, teléfonos y sitios web publicados en la ficha de Google Maps para "{currentLocation}".
            </p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <Radar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No hay clientes con los filtros seleccionados</h3>
            <p className="text-xs text-slate-400 mt-1">
              Prueba cambiando a "Todos" o realiza una búsqueda en otra ciudad.
            </p>
            <button
              onClick={() => setFilterOption('all')}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <LeadTable
            leads={filteredLeads}
            onStatusChange={handleStatusChange}
            onOpenPitch={(l) => setSelectedLeadForPitch(l)}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onExportSelected={() => handleExportCsv(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onStatusChange={handleStatusChange}
                onOpenPitch={(l) => setSelectedLeadForPitch(l)}
              />
            ))}
          </div>
        )}

        {/* BOTTOM PAGINATION BUTTONS (Exact Match to user screenshot) */}
        {!isLoading && leads.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col items-center justify-center text-center space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Green Button: Cargar más resultados (+20 negocios) */}
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore || isLoadingAll || leads.length >= 60}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cargando +20 negocios...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                    <span>Cargar más resultados (+20 negocios)</span>
                  </>
                )}
              </button>

              {/* Darker Button: Cargar todos los disponibles (hasta 60) */}
              <button
                onClick={handleLoadAll}
                disabled={isLoadingAll || isLoadingMore || leads.length >= 60}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Cargando todos hasta 60...</span>
                  </>
                ) : (
                  <span>Cargar todos los disponibles (hasta 60)</span>
                )}
              </button>
            </div>

            {/* Subtitle text matching user screenshot */}
            <p className="text-xs text-slate-400">
              Google Places (New) organiza los negocios en páginas de 20 hasta un máximo de 60 por búsqueda.
            </p>

            {leads.length >= 60 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Límite de 60 prospectos alcanzado para esta búsqueda geográfica</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Pitch Modal */}
      <PitchModal
        lead={selectedLeadForPitch}
        onClose={() => setSelectedLeadForPitch(null)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-medium border border-slate-700 shadow-2xl flex items-center gap-2 animate-bounce-short">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Radar Clientes</span>
            <span>•</span>
            <span>Google Maps Places</span>
          </div>
          <div>
            Prospección B2B profesional con paginación de hasta 60 negocios y exportación CSV
          </div>
        </div>
      </footer>
    </div>
  );
}
