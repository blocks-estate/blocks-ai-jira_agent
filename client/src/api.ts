const API = '/api';

export async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export interface KpiMetric {
  id: string; name: string; targetRange: string;
  current: number; target: number; unit: string;
  status: string; sourceSystem: string; owner: string;
  refreshCadence: string; trend: number[]; trendLabels: string[];
}

export interface FunnelStage {
  id: string; name: string; count: number;
  previousCount: number; source: string;
}

export interface WeeklyReviewSection {
  name: string; status: string;
  highlights: string[]; blockers: string[]; decisions: string[];
}

export interface ActionItem {
  id: string; description: string; owner: string;
  dueDate: string; status: string;
}

export interface SoVCompetitor {
  name: string; color: string;
  channels: Record<string, number>; overall: number;
}

export interface KpiDictionaryEntry {
  metric: string; formula: string; grain: string;
  eventTrigger: string; owner: string; source: string;
  cadence: string; notes: string;
}

export interface InstrumentationEvent {
  eventName: string; trigger: string;
  requiredProperties: string[]; validation: string;
}

export interface DocItem {
  name: string; views: number; downloads: number;
  lastWeekViews: number; lastWeekDownloads: number;
}

export interface DocCategory {
  name: string; documents: DocItem[];
}

export const api = {
  overview: () => fetchJSON<any>(`${API}/overview`),
  kpis: () => fetchJSON<any>(`${API}/kpis`),
  developerKpis: () => fetchJSON<any>(`${API}/kpis/developer`),
  investorKpis: () => fetchJSON<any>(`${API}/kpis/investor`),
  prKpis: () => fetchJSON<any>(`${API}/kpis/pr`),
  seoContentKpis: () => fetchJSON<any>(`${API}/kpis/seo-content`),
  trustComplianceKpis: () => fetchJSON<any>(`${API}/kpis/trust-compliance`),
  funnels: () => fetchJSON<any>(`${API}/funnels`),
  investorFunnel: () => fetchJSON<{ stages: FunnelStage[] }>(`${API}/funnels/investor`),
  developerFunnel: () => fetchJSON<{ stages: FunnelStage[] }>(`${API}/funnels/developer`),
  shareOfVoice: () => fetchJSON<any>(`${API}/share-of-voice`),
  documentTracking: () => fetchJSON<any>(`${API}/document-tracking`),
  subscriptionTracking: () => fetchJSON<any>(`${API}/subscription-tracking`),
  kpiDictionary: () => fetchJSON<any>(`${API}/kpi-dictionary`),
  weeklyReview: () => fetchJSON<any>(`${API}/weekly-review`),
  funnelInstrumentation: () => fetchJSON<any>(`${API}/funnel-instrumentation`),
};