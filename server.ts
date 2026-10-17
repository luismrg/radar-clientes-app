import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: ['.env.local', '.env'] });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '1mb' }));

// Initialize GoogleGenAI SDK on server side
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'radar-clientes' } },
    })
  : null;

/**
 * Validates a website URL returned directly by Google Places.
 */
function sanitizeWebsiteUrl(rawUrl: string | null | undefined): { 
  url: string | null; 
  type: 'official' | 'social' | 'none'; 
  socialUrl: string | null 
} {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { url: null, type: 'none', socialUrl: null };
  }

  let url = rawUrl.trim();
  const lower = url.toLowerCase();

  if (
    lower === 'n/a' ||
    lower === 'null' ||
    lower === 'none' ||
    lower === 'sin sitio web' ||
    lower === 'no disponible' ||
    lower === 'no tiene' ||
    lower === 'sin web' ||
    lower === 'undefined'
  ) {
    return { url: null, type: 'none', socialUrl: null };
  }

  url = url.replace(/[.,;)]+$/, '');

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (
      !['http:', 'https:'].includes(parsed.protocol)
      || !hostname.includes('.')
      || parsed.username
      || parsed.password
    ) {
      return { url: null, type: 'none', socialUrl: null };
    }
    const isSocial = ['instagram.com', 'facebook.com', 'linkedin.com', 'tiktok.com', 'wa.me']
      .some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
    if (isSocial) {
      return { url: null, type: 'social', socialUrl: parsed.href };
    }
    return { url: parsed.href, type: 'official', socialUrl: null };
  } catch {
    return { url: null, type: 'none', socialUrl: null };
  }
}

/**
 * Searches real places directly through Google Maps Platform Places API (New).
 */
app.post('/api/search-places', async (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Falta configurar GOOGLE_MAPS_API_KEY. Añádela en .env.local y activa Places API (New) y la facturación en Google Cloud.',
    });
  }

  const { query, location, page = 1, limit = 20, pageToken, coords } = req.body || {};
  if (typeof query !== 'string' || !query.trim() || query.trim().length > 200) {
    return res.status(400).json({ error: 'Escribe una categoría o tipo de negocio (máximo 200 caracteres).' });
  }
  if (typeof location !== 'string' || !location.trim() || location.trim().length > 200) {
    return res.status(400).json({ error: 'Escribe una ciudad o ubicación válida (máximo 200 caracteres).' });
  }
  if (pageToken !== undefined && (typeof pageToken !== 'string' || pageToken.length > 4096)) {
    return res.status(400).json({ error: 'El token de página de Google Maps no es válido.' });
  }

  const searchQuery = query.trim();
  const searchLocation = location.trim();
  const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
  const resultLimit = Number.isInteger(limit) ? Math.min(20, Math.max(1, limit)) : 20;
  const hasCoords = coords
    && Number.isFinite(coords.latitude)
    && Number.isFinite(coords.longitude)
    && coords.latitude >= -90
    && coords.latitude <= 90
    && coords.longitude >= -180
    && coords.longitude <= 180;

  const requestBody: Record<string, unknown> = {
    textQuery: hasCoords ? searchQuery : `${searchQuery} en ${searchLocation}`,
    pageSize: resultLimit,
    languageCode: 'es',
  };
  if (pageToken) requestBody.pageToken = pageToken;
  if (hasCoords) {
    requestBody.locationBias = {
      circle: {
        center: { latitude: coords.latitude, longitude: coords.longitude },
        radius: 10000,
      },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.nationalPhoneNumber',
          'places.websiteUri',
          'places.rating',
          'places.userRatingCount',
          'places.googleMapsUri',
          'places.location',
          'places.regularOpeningHours.weekdayDescriptions',
          'nextPageToken',
        ].join(','),
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const details = data.error?.message || `Google Maps respondió con el estado ${response.status}.`;
      const hint = response.status === 401 || response.status === 403
        ? ' Comprueba que la clave permita Places API (New), que la API esté habilitada y que la facturación esté activa.'
        : '';
      console.error('Google Places API request failed:', response.status, details);
      return res.status(response.status === 400 ? 400 : 502).json({ error: `${details}${hint}` });
    }

    const places = Array.isArray(data.places) ? data.places : [];
    const leads = places.flatMap((place: any, index: number) => {
      const name = place.displayName?.text?.trim();
      if (!name) return [];

      const address = place.formattedAddress || searchLocation;
      const mapsUrl = place.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${encodeURIComponent(place.id || '')}`;
      const sanitized = sanitizeWebsiteUrl(place.websiteUri);
      const latLng = place.location
        && Number.isFinite(place.location.latitude)
        && Number.isFinite(place.location.longitude)
        ? { latitude: place.location.latitude, longitude: place.location.longitude }
        : undefined;

      return [{
        id: place.id || `place-${currentPage}-${index}-${name}`,
        name,
        category: searchQuery,
        address,
        phone: place.nationalPhoneNumber || null,
        website: sanitized.url,
        normalizedWebsite: sanitized.url,
        hasWebsite: Boolean(sanitized.url),
        websiteType: sanitized.type,
        socialUrl: sanitized.socialUrl,
        websiteStatus: sanitized.url ? 'listed' as const : 'none' as const,
        rating: typeof place.rating === 'number' ? place.rating : 0,
        reviewsCount: typeof place.userRatingCount === 'number' ? place.userRatingCount : 0,
        schedule: place.regularOpeningHours?.weekdayDescriptions?.join(' · ') || 'Consultar horario en Google Maps',
        leadAnalysis: `Negocio de ${searchQuery} encontrado en Google Maps. Revisa su ficha para confirmar si encaja con tu oferta comercial.`,
        suggestedServices: ['Soluciones B2B', 'Servicios comerciales'],
        mapsUrl,
        googleMapsReviewSnippets: [],
        status: 'nuevo' as const,
        notes: '',
        createdAt: new Date().toISOString(),
        latLng,
      }];
    });

    const nextPageToken = typeof data.nextPageToken === 'string' ? data.nextPageToken : undefined;
    const groundingSources = leads.map((lead: { mapsUrl: string; name: string }) => ({
      uri: lead.mapsUrl,
      title: lead.name,
    }));

    return res.json({
      leads,
      summary: `Google Maps encontró ${leads.length} negocios para "${searchQuery}" en "${searchLocation}".`,
      groundingSources,
      query: searchQuery,
      location: searchLocation,
      timestamp: new Date().toISOString(),
      page: currentPage,
      hasMore: Boolean(nextPageToken),
      nextPageToken,
      totalLoaded: leads.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error de conexión desconocido.';
    console.error('Google Places API connection failed:', message);
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return res.status(502).json({
      error: isTimeout
        ? 'Google Maps tardó demasiado en responder. Intenta de nuevo.'
        : `No se pudo conectar con Google Maps Places: ${message}`,
    });
  } finally {
    clearTimeout(timeout);
  }
});

/**
 * URL reachability tester
 */
app.get('/api/check-url', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Parámetro URL requerido' });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return res.status(400).json({ error: 'La URL no es válida.' });
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: 'Solo se pueden comprobar sitios web HTTP o HTTPS.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    const isReachable = response.status >= 200 && response.status < 400;

    return res.json({
      url: targetUrl,
      reachable: isReachable,
      status: response.status,
    });
  } catch (err: any) {
    return res.json({
      url: targetUrl,
      reachable: false,
      error: err?.message || 'No responde',
    });
  } finally {
    clearTimeout(timeout);
  }
});

/**
 * Generates custom B2B outreach pitch (Email, WhatsApp, Phone script) for a lead
 */
app.post('/api/generate-pitch', async (req, res) => {
  const { lead, vendorProfile } = req.body;
  if (!lead || !lead.name) {
    return res.status(400).json({ error: 'Datos del cliente insuficientes' });
  }

  const vendorInfo = vendorProfile && vendorProfile.trim().length > 0
    ? vendorProfile
    : 'Proveedor de servicios y soluciones comerciales B2B';

  try {
    const prompt = `Actúa como un experto en ventas B2B y prospección comercial.
Genera una propuesta de acercamiento comercial altamente persuasiva, profesional y personalizada para este cliente potencial obtenido de Google Maps:

DATOS DEL CLIENTE:
- Nombre: ${lead.name}
- Rubro/Categoría: ${lead.category}
- Ubicación: ${lead.address}
- Sitio web: ${lead.website || 'No registrado'}
- Diagnóstico previo: ${lead.leadAnalysis}
- Servicios sugeridos: ${(lead.suggestedServices || []).join(', ')}

PERFIL DE QUIEN VENDE:
${vendorInfo}

Genera un JSON con este formato exacto:
\`\`\`json
{
  "companyName": "${lead.name}",
  "emailSubject": "Asunto de correo llamativo pero profesional",
  "emailBody": "Cuerpo del email personalizado (3 párrafos cortos con propuesta de valor clara y llamado a la acción).",
  "whatsappMessage": "Mensaje conciso para WhatsApp comercial (máximo 4 líneas con saludo cordial y motivo de contacto).",
  "phoneScript": "Guion telefónico de 45 segundos para conectar con el decisor o encargado de compras/operaciones.",
  "keySellingPoints": ["Punto clave 1", "Punto clave 2", "Punto clave 3"]
}
\`\`\``;

    if (!ai) throw new Error('GEMINI_API_KEY is not configured.');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      const data = JSON.parse(match[1]);
      return res.json(data);
    }
  } catch (error: any) {
    console.warn('Pitch AI notice, generating tailored pitch:', error?.message);
  }

  return res.json({
    companyName: lead.name,
    emailSubject: `Propuesta de colaboración estratégica para ${lead.name}`,
    emailBody: `Estimado equipo directivo de ${lead.name},\n\nHemos analizado con interés sus operaciones en ${lead.address}. Entendemos los desafíos en ${lead.category} y contamos con soluciones probadas en ${(lead.suggestedServices || ['optimización de servicios']).join(' y ')} diseñadas para aumentar su rentabilidad y eficiencia.\n\n¿Tendrían disponibilidad para una breve llamada de 10 minutos este jueves para presentarles nuestra propuesta de valor?\n\nAtentamente,\nEquipo Comercial B2B`,
    whatsappMessage: `Hola equipo de ${lead.name}, gusto en saludarles. Les escribo tras revisar su presencia en ${lead.address} para compartirles una solución en ${(lead.suggestedServices || ['servicios B2B'])[0]} que reduce costes operativos. ¿Podríamos coordinar 5 minutos hoy?`,
    phoneScript: `Buenos días, mi nombre es [Su Nombre]. Me comunico con ${lead.name} para conversar con la gerencia de operaciones o adquisiciones. Desarrollamos soluciones directas para empresas de su sector que optimizan ${(lead.suggestedServices || ['procesos'])[0]}. ¿Me podría comunicar con la persona a cargo?`,
    keySellingPoints: [
      `Enfoque especializado para empresas de ${lead.category}`,
      `Cobertura comprobada y presencia en ${lead.address}`,
      'Incremento medible en eficiencia operativa y rentabilidad'
    ]
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
