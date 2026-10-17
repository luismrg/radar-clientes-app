import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Loader2, 
  Filter, 
  LayoutGrid, 
  Table, 
  Globe, 
  Phone,
  Wrench,
  Stethoscope,
  Scissors,
  Sparkles,
  Utensils,
  Dumbbell,
  GraduationCap,
  Building,
  HardHat,
  HeartPulse,
  Car,
  Glasses,
  Briefcase,
  Landmark,
  Layers,
  RotateCcw,
  Ban
} from 'lucide-react';

interface SearchControlsProps {
  onSearch: (params: { query: string; location: string; coords?: { latitude: number; longitude: number } }) => void;
  isLoading: boolean;
  filterOption: 'all' | 'hasWebsite' | 'withoutWebsite' | 'hasPhone' | 'highRating';
  onFilterChange: (opt: 'all' | 'hasWebsite' | 'withoutWebsite' | 'hasPhone' | 'highRating') => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  totalFiltered: number;
  initialQuery?: string;
  initialLocation?: string;
}

export interface CategoryOption {
  id: string;
  label: string;
  group: string;
  icon: React.ReactNode;
}

export const CATEGORIES_LIST: CategoryOption[] = [
  // 1. Salud y Cuidado
  { id: 'clinicas-dentales', label: 'clínicas dentales', group: 'Salud', icon: <Stethoscope className="w-3.5 h-3.5 text-cyan-400" /> },
  { id: 'fisioterapeutas', label: 'fisioterapeutas', group: 'Salud', icon: <HeartPulse className="w-3.5 h-3.5 text-emerald-400" /> },
  { id: 'opticas', label: 'ópticas', group: 'Salud', icon: <Glasses className="w-3.5 h-3.5 text-teal-400" /> },
  { id: 'veterinarias', label: 'veterinarias', group: 'Salud', icon: <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> },

  // 2. Automotriz y Oficios
  { id: 'talleres-mecanicos', label: 'talleres mecánicos', group: 'Técnico y Motor', icon: <Wrench className="w-3.5 h-3.5 text-amber-400" /> },
  { id: 'reformas-contratistas', label: 'Reformas y contratistas', group: 'Técnico y Motor', icon: <HardHat className="w-3.5 h-3.5 text-orange-400" /> },
  { id: 'autoescuelas', label: 'autoescuelas', group: 'Técnico y Motor', icon: <Car className="w-3.5 h-3.5 text-yellow-400" /> },

  // 3. Belleza y Bienestar
  { id: 'peluquerias-salones', label: 'peluquerías y salones', group: 'Belleza', icon: <Scissors className="w-3.5 h-3.5 text-pink-400" /> },
  { id: 'centros-estetica', label: 'centros de estética', group: 'Belleza', icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> },
  { id: 'gimnasios', label: 'gimnasios', group: 'Belleza', icon: <Dumbbell className="w-3.5 h-3.5 text-red-400" /> },

  // 4. Servicios Profesionales y Finanzas
  { id: 'bancos-comerciales', label: 'bancos comerciales', group: 'Profesional', icon: <Landmark className="w-3.5 h-3.5 text-blue-400" /> },
  { id: 'ahorros-prestamos', label: 'ahorros y préstamos', group: 'Profesional', icon: <Landmark className="w-3.5 h-3.5 text-emerald-400" /> },
  { id: 'firmas-contables', label: 'Firmas contables y asesorías', group: 'Profesional', icon: <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> },
  { id: 'inmobiliarias', label: 'Inmobiliarias', group: 'Profesional', icon: <Building className="w-3.5 h-3.5 text-sky-400" /> },

  // 5. Hostelería y Educación
  { id: 'restaurantes', label: 'restaurantes', group: 'Hostelería y Educación', icon: <Utensils className="w-3.5 h-3.5 text-amber-500" /> },
  { id: 'academias-institutos', label: 'Academias e institutos', group: 'Hostelería y Educación', icon: <GraduationCap className="w-3.5 h-3.5 text-violet-400" /> },
];

export const SearchControls: React.FC<SearchControlsProps> = ({
  onSearch,
  isLoading,
  filterOption,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalFiltered,
  initialQuery = 'bancos comerciales',
  initialLocation = 'Santo Domingo',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | undefined>();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch({
      query: query.trim(),
      location: location.trim(),
      coords,
    });
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está disponible en su navegador.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocation('Mi ubicación actual');
        setGpsLoading(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSelectCategory = (catLabel: string) => {
    setQuery(catLabel);
    onSearch({
      query: catLabel,
      location: location.trim(),
      coords,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-slate-950/40 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Ciudad o ubicación donde deseas buscar */}
          <div className="md:col-span-4 relative">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Ciudad donde deseas buscar</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4 text-rose-400" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setCoords(undefined);
                }}
                placeholder="Ej. Santo Domingo, Santiago, Madrid, CDMX..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={handleUseGps}
                disabled={gpsLoading || isLoading}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors"
                title="Detectar mi ubicación actual vía GPS"
              >
                {gpsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Nicho o tipo de negocio local (exact layout and button as in screenshot) */}
          <div className="md:col-span-8">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-200">Nicho o tipo de negocio local</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAllCategories(!showAllCategories)}
                disabled={isLoading}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3 h-3" />
                {showAllCategories ? 'Cerrar catálogo' : 'Ver las 16 categorías'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej. bancos comerciales, ahorros y préstamos, clínicas dentales..."
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Botón Buscar (Verde con icono de lupa, como en captura) */}
              <button
                type="submit"
                disabled={isLoading}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Buscar</span>
                  </>
                )}
              </button>

              {/* Botón de actualización/recarga circular como en la captura */}
              <button
                type="button"
                onClick={() => onSearch({ query, location, coords })}
                disabled={isLoading}
                title="Actualizar y refrescar búsqueda"
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 cursor-pointer transition-colors shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Extended Category Catalog Modal/Drawer */}
        {showAllCategories && (
          <div className="p-4 bg-slate-850 rounded-xl border border-emerald-500/30 animate-fade-in space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <Layers className="w-4 h-4" /> Catálogo de 16 Nichos y Categorías:
              </span>
              <span className="text-[11px] text-slate-400">Haz clic en cualquier categoría para buscar de inmediato</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {CATEGORIES_LIST.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.label)}
                  disabled={isLoading}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left cursor-pointer transition-all ${
                    query.toLowerCase() === cat.label.toLowerCase()
                      ? 'bg-emerald-600/20 border-emerald-500 text-white font-semibold'
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="shrink-0">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Horizontal Carousel of Primary Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium shrink-0 mr-1">
            Accesos directos:
          </span>
          {CATEGORIES_LIST.slice(0, 10).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.label)}
              disabled={isLoading}
              className={`text-xs px-2.5 py-1 rounded-lg border shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                query.toLowerCase() === cat.label.toLowerCase()
                  ? 'bg-emerald-600/25 border-emerald-500/60 text-emerald-300 font-semibold shadow-xs'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/60 hover:text-white'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowAllCategories(!showAllCategories)}
            disabled={isLoading}
            className="text-xs px-2.5 py-1 rounded-lg border border-dashed border-slate-700 text-emerald-400 hover:bg-slate-800 shrink-0 font-medium cursor-pointer"
          >
            + Ver todas las 16
          </button>
        </div>
      </form>

      {/* Filter and View bar */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterOption === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({totalFiltered})
          </button>
          <button
            onClick={() => onFilterChange('hasWebsite')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              filterOption === 'hasWebsite'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3 text-blue-400" /> Web publicada en Maps
          </button>
          <button
            onClick={() => onFilterChange('withoutWebsite')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              filterOption === 'withoutWebsite'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-800 text-red-400 hover:text-white border border-red-500/20'
            }`}
          >
            <Ban className="w-3 h-3 text-red-500" /> Sin web en Maps
          </button>
          <button
            onClick={() => onFilterChange('hasPhone')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              filterOption === 'hasPhone'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3 h-3" /> Con Teléfono
          </button>
          <button
            onClick={() => onFilterChange('highRating')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filterOption === 'highRating'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ★ Rating 4.0+
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
          <button
            onClick={() => onViewModeChange('table')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista de Tabla Prospectos"
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('cards')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista de Tarjetas B2B"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
