export type LeadStatus = 'nuevo' | 'contactado' | 'en_negociacion' | 'cerrado' | 'descartado';

export interface Lead {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string | null;
  website: string | null;
  normalizedWebsite: string | null;
  hasWebsite: boolean;
  websiteType?: 'official' | 'social' | 'none';
  socialUrl?: string | null;
  websiteStatus: 'listed' | 'verified' | 'checking' | 'active' | 'unreachable' | 'none';
  rating: number;
  reviewsCount: number;
  schedule: string;
  leadAnalysis: string;
  suggestedServices: string[];
  mapsUrl: string;
  googleMapsReviewSnippets: string[];
  status: LeadStatus;
  notes: string;
  createdAt: string;
  latLng?: {
    latitude: number;
    longitude: number;
  };
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface SearchResponse {
  leads: Lead[];
  summary: string;
  groundingSources: GroundingSource[];
  query: string;
  location: string;
  timestamp: string;
  page: number;
  hasMore: boolean;
  totalLoaded: number;
  nextPageToken?: string;
}

export interface PitchResponse {
  companyName: string;
  emailSubject: string;
  emailBody: string;
  whatsappMessage: string;
  phoneScript: string;
  keySellingPoints: string[];
}
