const API = '/api';

export async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function apiPost(url: string, data: any): Promise<Response> {
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

export async function apiPatch(url: string, data: any): Promise<Response> {
  return fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

export async function apiDelete(url: string): Promise<Response> {
  return fetch(url, { method: 'DELETE' });
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

// ── Analytics & Reporting ──
export const analyticsReporting = {
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

// ── Developer Acquisition ──
export const developerAcquisition = {
  kpis: () => fetchJSON<any>(`${API}/developer-acquisition/kpis`),
  funnel: () => fetchJSON<any>(`${API}/developer-acquisition/funnel`),
  opportunities: () => fetchJSON<any>(`${API}/developer-acquisition/opportunities`),
  opportunitiesCreate: (data: any) => fetch(`${API}/developer-acquisition/opportunities`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  opportunitiesUpdate: (id: string, data: any) => fetch(`${API}/developer-acquisition/opportunities/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  opportunitiesDelete: (id: string) => fetch(`${API}/developer-acquisition/opportunities/${id}`, { method: 'DELETE' }),
  scorecards: () => fetchJSON<any>(`${API}/developer-acquisition/scorecards`),
  assets: () => fetchJSON<any>(`${API}/developer-acquisition/assets`),
  areas: () => fetchJSON<any>(`${API}/developer-acquisition/areas`),
  pipelineSummary: () => fetchJSON<any>(`${API}/developer-acquisition/pipeline-summary`),
};

// ── Investor Acquisition ──
export const investorAcquisition = {
  kpis: () => fetchJSON<any>(`${API}/investor-acquisition/kpis`),
  funnel: () => fetchJSON<any>(`${API}/investor-acquisition/funnel`),
  waitlist: () => fetchJSON<any>(`${API}/investor-acquisition/waitlist`),
  waitlistCreate: (data: any) => fetch(`${API}/investor-acquisition/waitlist`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  segments: () => fetchJSON<any>(`${API}/investor-acquisition/segments`),
  positioningTests: () => fetchJSON<any>(`${API}/investor-acquisition/positioning-tests`),
  complianceMatrix: () => fetchJSON<any>(`${API}/investor-acquisition/compliance-matrix`),
};

// ── Investor Servicing ──
export const investorServicing = {
  dashboard: () => fetchJSON<any>(`${API}/investor-servicing/dashboard`),
  supportTickets: () => fetchJSON<any>(`${API}/investor-servicing/support-tickets`),
  supportTicketsCreate: (data: any) => fetch(`${API}/investor-servicing/support-tickets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  supportTicketsUpdate: (id: string, data: any) => fetch(`${API}/investor-servicing/support-tickets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  educationCompletion: () => fetchJSON<any>(`${API}/investor-servicing/education-completion`),
  sixMonthGate: () => fetchJSON<any>(`${API}/investor-servicing/6-month-gate`),
  kpis: () => fetchJSON<any>(`${API}/investor-servicing/kpis`),
};

// ── Content & SEO ──
export const contentSeo = {
  kpis: () => fetchJSON<any>(`${API}/content-seo/kpis`),
  performance: () => fetchJSON<any>(`${API}/content-seo/performance`),
  assets: () => fetchJSON<any>(`${API}/content-seo/assets`),
  assetsCreate: (data: any) => fetch(`${API}/content-seo/assets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  assetsUpdate: (id: string, data: any) => fetch(`${API}/content-seo/assets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  glossary: () => fetchJSON<any>(`${API}/content-seo/glossary`),
  localizationQueue: () => fetchJSON<any>(`${API}/content-seo/localization-queue`),
  keywords: () => fetchJSON<any>(`${API}/content-seo/keywords`),
  rankings: () => fetchJSON<any>(`${API}/content-seo/rankings`),
};

// ── Compliance & Trust ──
export const complianceTrust = {
  kpis: () => fetchJSON<any>(`${API}/compliance-trust/kpis`),
  avoidList: () => fetchJSON<any>(`${API}/compliance-trust/avoid-list`),
  avoidListCreate: (data: any) => fetch(`${API}/compliance-trust/avoid-list`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  avoidListDelete: (id: string) => fetch(`${API}/compliance-trust/avoid-list/${id}`, { method: 'DELETE' }),
  claimMatrix: () => fetchJSON<any>(`${API}/compliance-trust/claim-matrix`),
  claimMatrixCreate: (data: any) => fetch(`${API}/compliance-trust/claim-matrix`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  claimMatrixUpdate: (id: string, data: any) => fetch(`${API}/compliance-trust/claim-matrix/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  checklists: () => fetchJSON<any>(`${API}/compliance-trust/checklists`),
  riskLanguage: () => fetchJSON<any>(`${API}/compliance-trust/risk-language`),
};

// ── Campaigns ──
export const campaigns = {
  kpis: () => fetchJSON<any>(`${API}/campaigns/kpis`),
  campaigns: () => fetchJSON<any>(`${API}/campaigns/`),
  referralTests: () => fetchJSON<any>(`${API}/campaigns/referral-tests`),
  referralTestsCreate: (data: any) => apiPost(`${API}/campaigns/referral-tests`, data),
  launchChecklists: () => fetchJSON<any>(`${API}/campaigns/launch-queue/checklists`),
};

// ── Sales Ops & CRM ──
export const salesOpsCrm = {
  kpis: () => fetchJSON<any>(`${API}/loi/kpis`),
  loiTracking: () => fetchJSON<any>(`${API}/loi/tracking`),
  loiCreate: (data: any) => apiPost(`${API}/loi/tracking`, data),
  loiUpdate: (id: string, data: any) => apiPatch(`${API}/loi/tracking/${id}`, data),
  loiDelete: (id: string) => apiDelete(`${API}/loi/tracking/${id}`),
  pipeline: () => fetchJSON<any>(`${API}/loi/pipeline`),
  reporting: () => fetchJSON<any>(`${API}/loi/reporting`),
};

// ── Risk Management ──
export const riskManagement = {
  kpis: () => fetchJSON<any>(`${API}/risk-management/kpis`),
  mitigationRegister: () => fetchJSON<any>(`${API}/risk-management/mitigation-register`),
  mitigationRegisterCreate: (data: any) => fetch(`${API}/risk-management/mitigation-register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  mitigationRegisterUpdate: (id: string, data: any) => fetch(`${API}/risk-management/mitigation-register/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  marketOutlook: () => fetchJSON<any>(`${API}/risk-management/market-outlook`),
  triggers: () => fetchJSON<any>(`${API}/risk-management/triggers`),
  talkingPoints: () => fetchJSON<any>(`${API}/risk-management/talking-points`),
  escalationGuides: () => fetchJSON<any>(`${API}/risk-management/escalation-guides`),
  faq: () => fetchJSON<any>(`${API}/risk-management/faq`),
  faqCreate: (data: any) => fetch(`${API}/risk-management/faq`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
};

// ── Regional Expansion ──
export const regionalExpansion = {
  kpis: () => fetchJSON<any>(`${API}/regional-expansion/kpis`),
  jurisdictions: () => fetchJSON<any>(`${API}/regional-expansion/jurisdictions`),
  guardrails: () => fetchJSON<any>(`${API}/regional-expansion/guardrails`),
  entryMemos: () => fetchJSON<any>(`${API}/regional-expansion/entry-memos`),
  entryMemosCreate: (data: any) => fetch(`${API}/regional-expansion/entry-memos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  claimReference: () => fetchJSON<any>(`${API}/regional-expansion/claim-reference`),
};

// ── Product & Platform ──
export const productPlatform = {
  kpis: () => fetchJSON<any>(`${API}/product-platform/kpis`),
  apiUsage: () => fetchJSON<any>(`${API}/platform/api-usage`),
  integrationRoadmap: () => fetchJSON<any>(`${API}/platform/integration-roadmap`),
  governanceMatrix: () => fetchJSON<any>(`${API}/platform/governance-matrix`),
  integrations: () => fetchJSON<any>(`${API}/platform/integrations`),
};

// ── Product Marketing ──
export const productMarketing = {
  kpis: () => fetchJSON<any>(`${API}/product-marketing/kpis`),
  launchTracker: () => fetchJSON<any>(`${API}/product-marketing/launch-tracker`),
  launchTrackerCreate: (data: any) => fetch(`${API}/product-marketing/launch-tracker`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  launchTrackerUpdate: (id: string, data: any) => fetch(`${API}/product-marketing/launch-tracker/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  messaging: () => fetchJSON<any>(`${API}/product-marketing/messaging`),
  feeStructure: () => fetchJSON<any>(`${API}/product-marketing/fee-structure`),
};

// ── PR & Events ──
export const prEvents = {
  kpis: () => fetchJSON<any>(`${API}/pr-events/kpis`),
  mentions: () => fetchJSON<any>(`${API}/pr-events/mentions`),
  mentionsCreate: (data: any) => apiPost(`${API}/pr-events/mentions`, data),
  events: () => fetchJSON<any>(`${API}/pr-events/events`),
  eventsCreate: (data: any) => apiPost(`${API}/pr-events/events`, data),
  breakfastSessions: () => fetchJSON<any>(`${API}/pr-events/breakfast-sessions`),
  breakfastSessionsCreate: (data: any) => apiPost(`${API}/pr-events/breakfast-sessions`, data),
};

// ── Positioning & Messaging ──
export const positioningMessaging = {
  kpis: () => fetchJSON<any>(`${API}/positioning-messaging/kpis`),
  differentiationMatrix: () => fetchJSON<any>(`${API}/positioning-messaging/differentiation-matrix`),
  themes: () => fetchJSON<any>(`${API}/positioning-messaging/themes`),
  messagingGuide: () => fetchJSON<any>(`${API}/positioning-messaging/messaging-guide`),
  guardrails: () => fetchJSON<any>(`${API}/positioning-messaging/guardrails`),
};

// ── Partnerships ──
export const partnerships = {
  kpis: () => fetchJSON<any>(`${API}/partnerships/kpis`),
  pipeline: () => fetchJSON<any>(`${API}/partnerships/pipeline`),
  pipelineUpdate: (id: string, data: any) => apiPatch(`${API}/partnerships/pipeline/${id}`, data),
  diligence: () => fetchJSON<any>(`${API}/partnerships/diligence`),
  useCaseMapping: () => fetchJSON<any>(`${API}/partnerships/use-case-mapping`),
};

// ── Paid Media ──
export const paidMedia = {
  kpis: () => fetchJSON<any>(`${API}/paid-media/kpis`),
  creativeLibrary: () => fetchJSON<any>(`${API}/paid-media/creative-library`),
  avoidList: () => fetchJSON<any>(`${API}/paid-media/avoid-list`),
  avoidListCreate: (data: any) => apiPost(`${API}/paid-media/avoid-list`, data),
  avoidListDelete: (id: string) => apiDelete(`${API}/paid-media/avoid-list/${id}`),
  reviewQueue: () => fetchJSON<any>(`${API}/paid-media/review-queue`),
};

// ── Operations ──
export const operations = {
  kpis: () => fetchJSON<any>(`${API}/operations/kpis`),
  vendorRegistry: () => fetchJSON<any>(`${API}/operations/vendor-registry`),
  vendorRegistryCreate: (data: any) => fetch(`${API}/operations/vendor-registry`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  onboardingWorkflow: () => fetchJSON<any>(`${API}/operations/onboarding-workflow`),
  onboardingWorkflowAddChecklist: (data: any) => fetch(`${API}/operations/onboarding-workflow/checklists`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  escalationRules: () => fetchJSON<any>(`${API}/operations/escalation-rules`),
  escalationRulesCreate: (data: any) => fetch(`${API}/operations/escalation-rules`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  budgetModel: () => fetchJSON<any>(`${API}/operations/budget-model`),
  budgetModelUpdate: (data: any) => fetch(`${API}/operations/budget-model`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
};

// ── Websites & Conversion ──
export const websitesConversion = {
  kpis: () => fetchJSON<any>(`${API}/websites-conversion/kpis`),
  kycHandoff: () => fetchJSON<any>(`${API}/websites-conversion/kyc-handoff`),
  funnelMetrics: () => fetchJSON<any>(`${API}/websites-conversion/funnel-metrics`),
};
