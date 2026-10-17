import { Lead, SearchResponse, PitchResponse } from '../types/radar';

export async function searchPlaces(params: {
  query: string;
  location: string;
  page?: number;
  limit?: number;
  pageToken?: string;
  coords?: { latitude: number; longitude: number };
}): Promise<SearchResponse> {
  const response = await fetch('/api/search-places', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: No se pudo completar la búsqueda en Google Maps.`);
  }

  return response.json();
}

export async function checkUrlReachability(url: string): Promise<{ reachable: boolean; status?: number; error?: string }> {
  try {
    const response = await fetch(`/api/check-url?url=${encodeURIComponent(url)}`);
    if (!response.ok) return { reachable: false };
    return response.json();
  } catch {
    return { reachable: false };
  }
}

export async function generatePitch(params: {
  lead: Lead;
  vendorProfile?: string;
}): Promise<PitchResponse> {
  const response = await fetch('/api/generate-pitch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'No se pudo generar la propuesta comercial.');
  }

  return response.json();
}
