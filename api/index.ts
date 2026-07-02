import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();

app.use(cors());
app.use(express.json());

function loadData<T>(filename: string): T | null {
  const candidates = [
    path.resolve(process.cwd(), 'data', filename),
    path.resolve(__dirname, '..', 'data', filename),
    path.resolve(__dirname, '..', '..', 'data', filename),
  ];
  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  }
  return null;
}

function loadDomainData<T>(domainName: string): T | null {
  return loadData<T>(`${domainName}.json`);
}

// ─── Health Check ──────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════════════
// ANALYTICS & REPORTING DOMAIN (existing KPIs from kpis.json)
// ═══════════════════════════════════════════════════════════════════════

// ─── Core KPI Data ───
app.get('/api/kpis', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data);
});

// ─── Developer KPIs ───
app.get('/api/kpis/developer', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.developerKPIs);
});

// ─── Investor KPIs ───
app.get('/api/kpis/investor', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.investorKPIs);
});

// ─── PR KPIs ───
app.get('/api/kpis/pr', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.prKPIs);
});

// ─── SEO/Content KPIs ───
app.get('/api/kpis/seo-content', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.seoContentKPIs);
});

// ─── Trust/Compliance KPIs ───
app.get('/api/kpis/trust-compliance', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.trustComplianceKPIs);
});

// ─── Funnel Data ───
app.get('/api/funnels', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json({
    investor: data.investorFunnel,
    developer: data.developerFunnel,
  });
});

app.get('/api/funnels/investor', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.investorFunnel);
});

app.get('/api/funnels/developer', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.developerFunnel);
});

// ─── Share of Voice ───
app.get('/api/share-of-voice', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.shareOfVoice);
});

// ─── Document Tracking ───
app.get('/api/document-tracking', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.documentTracking);
});

// ─── Subscription Tracking ───
app.get('/api/subscription-tracking', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.subscriptionTracking);
});

// ─── KPI Dictionary ───
app.get('/api/kpi-dictionary', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.kpiDictionary);
});

// ─── Weekly Review ───
app.get('/api/weekly-review', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.weeklyReview);
});

// ─── Funnel Instrumentation Specs ───
app.get('/api/funnel-instrumentation', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.funnelInstrumentation);
});

// ─── Dashboard Overview ───
app.get('/api/overview', (_req, res) => {
  const data = loadData<any>('kpis.json');
  if (!data) return res.status(404).json({ error: 'No data found' });

  const overview = {
    meta: data.meta,
    dev90Status: data.developerKPIs['90days'].metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    dev12Status: data.developerKPIs['12months'].metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    inv90Status: data.investorKPIs['90days'].metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    inv12Status: data.investorKPIs['12months'].metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    prStatus: data.prKPIs.metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    seoStatus: data.seoContentKPIs.metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    tcStatus: data.trustComplianceKPIs.metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    weeklyReview: {
      status: data.weeklyReview.sections.map((s: any) => ({ name: s.name, status: s.status })),
      openActions: data.weeklyReview.actionItems.filter((a: any) => a.status !== 'done').length,
    },
    funnelTotals: {
      investorConversionRate:
        data.investorFunnel.stages[data.investorFunnel.stages.length - 1].count /
        data.investorFunnel.stages[0].count,
      developerConversionRate:
        data.developerFunnel.stages[data.developerFunnel.stages.length - 1].count /
        data.developerFunnel.stages[0].count,
      investorStages: data.investorFunnel.stages,
      developerStages: data.developerFunnel.stages,
    },
  };

  res.json(overview);
});

// ═══════════════════════════════════════════════════════════════════════
// DEVELOPER ACQUISITION DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/developer-acquisition/kpis', (_req, res) => {
  const data = loadDomainData<any>('developer-acquisition') || loadData<any>('kpis.json');
  res.json(data?.kpis || { '90days': { description: 'Developer acquisition KPIs', metrics: [] }, '12months': { description: 'Developer acquisition KPIs - annual', metrics: [] } });
});

app.get('/api/developer-acquisition/funnel', (_req, res) => {
  res.json({ description: 'Developer acquisition funnel', stages: [] });
});

app.get('/api/developer-acquisition/opportunities', (_req, res) => {
  const data = loadDomainData<any>('developer-acquisition');
  res.json(data?.opportunities || { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 20 });
});

app.post('/api/developer-acquisition/opportunities', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
});

app.get('/api/developer-acquisition/opportunities/:id', (req, res) => {
  res.json({ id: req.params.id, developerName: 'Sample Developer', stage: 'target-identified', owner: 'GTM Lead', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
});

app.patch('/api/developer-acquisition/opportunities/:id', (req, res) => {
  const data = loadDomainData<any>('developer-acquisition');
  res.json(data?.opportunities?.items?.[0] || { id: req.params.id, developerName: 'Sample Developer', stage: req.body.stage || 'target-identified', owner: 'GTM Lead', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
});

app.get('/api/developer-acquisition/scorecards', (_req, res) => {
  res.json([]);
});

app.post('/api/developer-acquisition/scorecards', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), assetId: _req.body.assetId, totalScore: 0, categories: [], tier: 'tier-1', createdAt: new Date().toISOString() });
});

app.get('/api/developer-acquisition/scorecards/:id', (req, res) => {
  res.json({ id: req.params.id, assetId: 'sample-asset', totalScore: 75, categories: [{ name: 'Asset Readiness', weight: 0.20, score: 80, evidence: 'Evidence' }], tier: 'tier-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
});

app.get('/api/developer-acquisition/assets', (_req, res) => {
  res.json([]);
});

app.post('/api/developer-acquisition/assets', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), name: _req.body.name, assetType: _req.body.assetType, location: _req.body.location, status: 'active', createdAt: new Date().toISOString() });
});

app.get('/api/developer-acquisition/areas', (_req, res) => {
  res.json([
    { name: 'Dubai Marina', rank: 1, marketFamiliarity: 'High', investorDemand: 'Very High', supplyAvailability: 'Medium', rationale: 'Top-tier recognizable waterfront community' },
    { name: 'Palm Jumeirah', rank: 2, marketFamiliarity: 'Very High', investorDemand: 'High', supplyAvailability: 'Low', rationale: 'Iconic address with strong investor interest' },
    { name: 'Downtown Dubai', rank: 3, marketFamiliarity: 'Very High', investorDemand: 'Very High', supplyAvailability: 'Medium', rationale: 'Central business district with wide appeal' },
  ]);
});

app.get('/api/developer-acquisition/pipeline-summary', (_req, res) => {
  res.json({ totalOpportunities: 24, totalEstimatedValue: 320000000, stageDistribution: [{ id: 'target-identified', name: 'Target Identified', count: 10 }, { id: 'outreach', name: 'Outreach in Progress', count: 8 }, { id: 'loi-signed', name: 'LOI Signed', count: 4 }], averageVelocityDays: 45 });
});

// ═══════════════════════════════════════════════════════════════════════
// INVESTOR ACQUISITION DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/investor-acquisition/kpis', (_req, res) => {
  const data = loadDomainData<any>('investor-acquisition');
  res.json(data?.kpis || { '90days': { description: 'Investor acquisition KPIs', metrics: [] }, '12months': { description: 'Investor acquisition KPIs - annual', metrics: [] } });
});

app.get('/api/investor-acquisition/funnel', (_req, res) => {
  res.json({ description: 'Investor acquisition funnel', stages: [] });
});

app.get('/api/investor-acquisition/waitlist', (_req, res) => {
  const data = loadDomainData<any>('investor-acquisition');
  res.json(data?.waitlist || { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 20 });
});

app.post('/api/investor-acquisition/waitlist', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, signedUpAt: new Date().toISOString() });
});

app.get('/api/investor-acquisition/segments', (_req, res) => {
  res.json([
    { id: crypto.randomUUID(), name: 'UAE/GCC HNWIs', description: 'High-net-worth individuals in UAE/GCC', messagingAngle: 'Managed access to premium opportunities', inclusionRules: 'Net worth > $1M', estimatedSize: 50000, createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), name: 'Expats in UAE', description: 'International professionals residing in UAE', messagingAngle: 'Simple tokenized real estate investing', estimatedSize: 200000, createdAt: new Date().toISOString() },
  ]);
});

app.post('/api/investor-acquisition/segments', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, createdAt: new Date().toISOString() });
});

app.get('/api/investor-acquisition/positioning-tests', (_req, res) => {
  res.json([]);
});

app.post('/api/investor-acquisition/positioning-tests', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'draft', createdAt: new Date().toISOString() });
});

app.get('/api/investor-acquisition/compliance-matrix', (_req, res) => {
  res.json([]);
});

// ═══════════════════════════════════════════════════════════════════════
// INVESTOR SERVICING DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/investor-servicing/dashboard', (_req, res) => {
  res.json({ totalOpenTickets: 12, slaComplianceRate: 94.5, averageResponseTimeHours: 2.3, educationCompletionRate: 78.2, openEscalations: 2, volumeTrend: { label: 'Weekly Volume', values: [45, 52, 38, 41], changePercentage: -0.08 } });
});

app.get('/api/investor-servicing/support-tickets', (_req, res) => {
  const data = loadDomainData<any>('investor-servicing');
  res.json(data?.supportTickets || { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 20 });
});

app.post('/api/investor-servicing/support-tickets', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'active', createdAt: new Date().toISOString() });
});

app.get('/api/investor-servicing/support-tickets/:id', (req, res) => {
  res.json({ id: req.params.id, investorId: 'sample-investor', category: 'general', subject: 'Sample Ticket', status: 'active', createdAt: new Date().toISOString() });
});

app.patch('/api/investor-servicing/support-tickets/:id', (req, res) => {
  res.json({ id: req.params.id, investorId: 'sample-investor', category: 'general', subject: 'Sample Ticket', status: req.body.status || 'active', createdAt: new Date().toISOString() });
});

app.get('/api/investor-servicing/education-completion', (_req, res) => {
  res.json([]);
});

app.post('/api/investor-servicing/education-completion', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, completedAt: new Date().toISOString() });
});

app.get('/api/investor-servicing/six-month-gate', (_req, res) => {
  res.json({ periodEnd: '2026-06-30', executiveSummary: 'Investor servicing has met all SLA targets.', supportVolumeTrend: { label: 'Monthly Volume', values: [120, 115, 108, 95, 88, 82], changePercentage: -0.31 }, topRisks: ['Education completion rate declining', 'Increased KYC escalations'], mitigationOptions: ['Automated education reminders', 'Additional KYC support resources'], latestDecision: null });
});

app.get('/api/investor-servicing/six-month-gate/decisions', (_req, res) => {
  res.json([]);
});

app.post('/api/investor-servicing/six-month-gate/decisions', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, decidedAt: new Date().toISOString() });
});

app.get('/api/investor-servicing/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Investor servicing KPIs', metrics: [] }, '12months': { description: 'Investor servicing KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// CONTENT & SEO DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/content/performance', (_req, res) => {
  res.json({ totalPageViews: 45200, averageTimeOnPageSeconds: 145, bounceRate: 0.38, totalDownloads: 1280, contentAssistedConversions: 342, performanceByCategory: [], trends: { series: [{ label: 'Page Views', values: [3200, 4100, 3800, 4500], changePercentage: 0.12 }], labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] } });
});

app.get('/api/content/assets', (_req, res) => {
  res.json({ items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 20 });
});

app.post('/api/content/assets', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'draft', language: 'en-us', createdAt: new Date().toISOString() });
});

app.get('/api/content/assets/:id', (req, res) => {
  res.json({ id: req.params.id, title: 'Sample Content', assetType: 'blog-post', status: 'published', language: 'en-us', createdAt: new Date().toISOString() });
});

app.patch('/api/content/assets/:id', (req, res) => {
  res.json({ id: req.params.id, title: 'Sample Content', assetType: 'blog-post', status: req.body.status || 'published', language: 'en-us', createdAt: new Date().toISOString() });
});

app.get('/api/content/glossary', (_req, res) => {
  res.json([]);
});

app.post('/api/content/glossary/entries', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'draft', updatedAt: new Date().toISOString() });
});

app.get('/api/content/localization-queue', (_req, res) => {
  res.json([]);
});

app.post('/api/content/localization-queue', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'queued', createdAt: new Date().toISOString() });
});

app.get('/api/content/seo/keywords', (_req, res) => {
  res.json([{ id: crypto.randomUUID(), keyword: 'tokenized real estate Dubai', currentRank: 8, previousRank: 12, searchVolume: 2400, trafficContribution: 0.12, lastUpdated: new Date().toISOString() }]);
});

app.get('/api/content/seo/rankings', (_req, res) => {
  res.json({ description: 'Keyword ranking trends', rankings: [{ keyword: 'tokenized real estate Dubai', rankHistory: [15, 14, 12, 10, 8, 7], labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] }] });
});

app.get('/api/content/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Content & SEO KPIs', metrics: [] }, '12months': { description: 'Content & SEO KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// COMPLIANCE & TRUST DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/compliance/avoid-list', (_req, res) => {
  res.json([]);
});

app.post('/api/compliance/avoid-list', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, reviewerSignOff: false, updatedAt: new Date().toISOString() });
});

app.delete('/api/compliance/avoid-list/:id', (_req, res) => {
  res.status(204).send();
});

app.get('/api/compliance/claim-matrix', (_req, res) => {
  res.json([]);
});

app.post('/api/compliance/claim-matrix', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, approvalStatus: 'pending', updatedAt: new Date().toISOString() });
});

app.patch('/api/compliance/claim-matrix/:id', (req, res) => {
  res.json({ id: req.params.id, claim: 'Sample Claim', category: 'pending-review', approvalStatus: req.body.approvalStatus || 'pending', updatedAt: new Date().toISOString() });
});

app.get('/api/compliance/checklists', (_req, res) => {
  res.json([]);
});

app.post('/api/compliance/checklists', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'active', createdAt: new Date().toISOString() });
});

app.get('/api/compliance/risk-language', (_req, res) => {
  res.json([]);
});

app.post('/api/compliance/risk-language/modules', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, version: 1, approvalStatus: 'draft', updatedAt: new Date().toISOString() });
});

app.get('/api/compliance/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Compliance & trust KPIs', metrics: [] }, '12months': { description: 'Compliance & trust KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// CAMPAIGNS DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/campaigns', (_req, res) => {
  const data = loadDomainData<any>('campaigns');
  res.json(data?.campaigns || { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 20 });
});

app.post('/api/campaigns', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'drafting', metrics: {}, createdAt: new Date().toISOString() });
});

app.get('/api/campaigns/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Sample Campaign', status: 'live', owner: 'GTM Team', createdAt: new Date().toISOString() });
});

app.patch('/api/campaigns/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Sample Campaign', status: req.body.status || 'live', owner: 'GTM Team', createdAt: new Date().toISOString() });
});

app.get('/api/campaigns/referral-tests', (_req, res) => {
  res.json([]);
});

app.post('/api/campaigns/referral-tests', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'designing', createdAt: new Date().toISOString() });
});

app.get('/api/campaigns/launch-queue', (_req, res) => {
  res.json([]);
});

app.post('/api/campaigns/launch-queue/checklists', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), campaignId: _req.body.campaignId, checks: _req.body.checks, allPassed: false, createdAt: new Date().toISOString() });
});

app.get('/api/campaigns/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Campaign KPIs', metrics: [] }, '12months': { description: 'Campaign KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// SALES OPS & CRM DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/loi/tracking', (_req, res) => {
  const data = loadDomainData<any>('sales-ops-crm');
  res.json(data?.loiRecords || { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 20 });
});

app.post('/api/loi/tracking', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
});

app.get('/api/loi/tracking/:id', (req, res) => {
  res.json({ id: req.params.id, counterpartyName: 'Sample Counterparty', counterpartyType: 'developer', stage: 'draft', owner: 'GTM Lead', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
});

app.patch('/api/loi/tracking/:id', (req, res) => {
  res.json({ id: req.params.id, counterpartyName: 'Sample Counterparty', counterpartyType: 'developer', stage: req.body.stage || 'draft', owner: 'GTM Lead', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
});

app.delete('/api/loi/tracking/:id', (_req, res) => {
  res.status(204).send();
});

app.get('/api/loi/pipeline', (_req, res) => {
  res.json({ totalRecords: 24, totalEstimatedValue: 180000000, stageDistribution: [{ id: 'draft', name: 'Draft', count: 8, value: 60000000 }, { id: 'sent', name: 'Sent', count: 6, value: 45000000 }, { id: 'under-review', name: 'Under Review', count: 4, value: 30000000 }, { id: 'signed', name: 'Signed', count: 6, value: 45000000 }], ownerDistribution: [{ owner: 'GTM Lead', count: 12, totalValue: 90000000 }, { owner: 'Sales Lead', count: 12, totalValue: 90000000 }], avgDaysToSign: 38 });
});

app.get('/api/loi/reporting', (_req, res) => {
  res.json({ signedCount: 6, pendingCount: 18, expiredCount: 2, notProceedingCount: 1, conversionRateSigned: 0.25, valueByStage: [{ stage: 'signed', count: 6, totalValue: 45000000 }, { stage: 'pending', count: 18, totalValue: 135000000 }], monthlyTrend: { series: [{ label: 'LOIs Signed', values: [1, 2, 1, 2], changePercentage: 0.0 }], labels: ['Mar', 'Apr', 'May', 'Jun'] } });
});

app.get('/api/loi/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Sales ops CRM KPIs', metrics: [] }, '12months': { description: 'Sales ops CRM KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// RISK MANAGEMENT DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/risk/mitigation-register', (_req, res) => {
  res.json([]);
});

app.post('/api/risk/mitigation-register', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'active', updatedAt: new Date().toISOString() });
});

app.patch('/api/risk/mitigation-register/:id', (req, res) => {
  res.json({ id: req.params.id, riskName: 'Sample Risk', category: 'market', severity: req.body.severity || 'medium', likelihood: 'possible', mitigationStrategy: 'Ongoing monitoring', owner: 'Risk Owner', status: 'active', updatedAt: new Date().toISOString() });
});

app.get('/api/risk/market-outlook', (_req, res) => {
  res.json({ summary: 'Dubai real estate market remains stable with moderate growth.', keyIndicators: [{ indicator: 'Dubai Real Estate Price Index', currentValue: 185.2, trend: 'rising', alertTriggered: false }, { indicator: 'Transaction Volume', currentValue: 45200, trend: 'stable', alertTriggered: false }], activeTriggers: [] });
});

app.post('/api/risk/market-outlook/triggers', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, lastTriggered: null, createdAt: new Date().toISOString() });
});

app.get('/api/risk/talking-points', (_req, res) => {
  res.json([]);
});

app.post('/api/risk/talking-points', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, version: 1, updatedAt: new Date().toISOString() });
});

app.get('/api/risk/escalation-guides', (_req, res) => {
  res.json([]);
});

app.post('/api/risk/escalation-guides', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, updatedAt: new Date().toISOString() });
});

app.get('/api/risk/faq', (_req, res) => {
  res.json([]);
});

app.post('/api/risk/faq', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'draft', updatedAt: new Date().toISOString() });
});

app.get('/api/risk/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Risk management KPIs', metrics: [] }, '12months': { description: 'Risk management KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// REGIONAL EXPANSION DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/regional/jurisdictions', (_req, res) => {
  res.json([
    { id: crypto.randomUUID(), name: 'UAE', marketEntryStatus: 'ready-to-enter', regulatoryBody: 'Securities and Commodities Authority (SCA)', primaryLanguage: 'Arabic', priority: 1, updatedAt: new Date().toISOString() },
    { id: crypto.randomUUID(), name: 'Saudi Arabia', marketEntryStatus: 'partner-led', regulatoryBody: 'Capital Market Authority (CMA)', primaryLanguage: 'Arabic', priority: 2, updatedAt: new Date().toISOString() },
    { id: crypto.randomUUID(), name: 'Bahrain', marketEntryStatus: 'in-assessment', regulatoryBody: 'Central Bank of Bahrain (CBB)', primaryLanguage: 'Arabic', priority: 3, updatedAt: new Date().toISOString() },
    { id: crypto.randomUUID(), name: 'Kuwait', marketEntryStatus: 'not-assessed', regulatoryBody: 'Capital Markets Authority (CMA)', primaryLanguage: 'Arabic', priority: 4, updatedAt: new Date().toISOString() },
  ]);
});

app.post('/api/regional/jurisdictions', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, marketEntryStatus: 'not-assessed', updatedAt: new Date().toISOString() });
});

app.get('/api/regional/jurisdictions/:id/guardrails', (_req, res) => {
  res.json([]);
});

app.post('/api/regional/jurisdictions/:id/guardrails', (req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ...req.body, jurisdictionId: req.params.id, updatedAt: new Date().toISOString() });
});

app.get('/api/regional/entry-memos', (_req, res) => {
  res.json([]);
});

app.post('/api/regional/entry-memos', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'draft', createdAt: new Date().toISOString() });
});

app.get('/api/regional/claim-reference', (_req, res) => {
  res.json([]);
});

app.post('/api/regional/claim-reference', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, updatedAt: new Date().toISOString() });
});

app.get('/api/regional/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Regional expansion KPIs', metrics: [] }, '12months': { description: 'Regional expansion KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// PRODUCT & PLATFORM DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/platform/api-usage', (_req, res) => {
  res.json({ totalRequests: 142000, requestsByEndpoint: { '/api/kpis': 45000, '/api/overview': 32000, '/api/funnels': 18000, '/api/loi/tracking': 12000, '/api/campaigns': 35000 }, averageLatencyMs: 45, errorRate: 0.003, activeConsumers: 8, usageTrend: { series: [{ label: 'Daily Requests', values: [4200, 4800, 5100, 4900, 5300, 5600, 5800], changePercentage: 0.38 }], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] } });
});

app.get('/api/platform/integration-roadmap', (_req, res) => {
  res.json([
    { id: crypto.randomUUID(), phase: 'phase-0-manual', name: 'Manual Phase', description: 'Current manual integration setup', targetUsers: 'Internal team', enabledUseCases: ['Manual data upload'], prerequisites: [], dependencies: [], readinessGates: [], targetDate: '2026-04-01', status: 'completed', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), phase: 'phase-1-private-beta', name: 'Private Beta APIs', description: 'First API version for beta partners', targetUsers: 'Selected partners', enabledUseCases: ['KYC integration', 'Data sync'], prerequisites: ['API documentation'], dependencies: ['Auth provider'], readinessGates: ['Security audit passed'], targetDate: '2026-08-01', status: 'active', createdAt: new Date().toISOString() },
  ]);
});

app.post('/api/platform/integration-roadmap/phases', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'active', createdAt: new Date().toISOString() });
});

app.get('/api/platform/governance-matrix', (_req, res) => {
  res.json([]);
});

app.post('/api/platform/governance-matrix', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, updatedAt: new Date().toISOString() });
});

app.get('/api/platform/integrations', (_req, res) => {
  res.json([]);
});

app.post('/api/platform/integrations', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, createdAt: new Date().toISOString() });
});

app.get('/api/platform/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Product and platform KPIs', metrics: [] }, '12months': { description: 'Product and platform KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// PRODUCT MARKETING DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/product-marketing/launch-tracker', (_req, res) => {
  res.json([]);
});

app.post('/api/product-marketing/launch-tracker', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'not-started', createdAt: new Date().toISOString() });
});

app.patch('/api/product-marketing/launch-tracker/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Sample Launch Item', status: req.body.status || 'not-started', owner: 'Marketing Lead', createdAt: new Date().toISOString() });
});

app.get('/api/product-marketing/messaging', (_req, res) => {
  res.json([]);
});

app.post('/api/product-marketing/messaging', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, complianceStatus: 'draft', version: 1, updatedAt: new Date().toISOString() });
});

app.get('/api/product-marketing/fee-structure', (_req, res) => {
  res.json([]);
});

app.post('/api/product-marketing/fee-structure', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'active', updatedAt: new Date().toISOString() });
});

app.get('/api/product-marketing/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Product marketing KPIs', metrics: [] }, '12months': { description: 'Product marketing KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// PR & EVENTS DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/pr/mentions', (_req, res) => {
  const data = loadDomainData<any>('pr-events');
  res.json(data?.mentions || { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 20 });
});

app.post('/api/pr/mentions', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body });
});

app.get('/api/pr/events', (_req, res) => {
  res.json([]);
});

app.post('/api/pr/events', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, createdAt: new Date().toISOString() });
});

app.get('/api/pr/breakfast-sessions', (_req, res) => {
  res.json([]);
});

app.post('/api/pr/breakfast-sessions', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, createdAt: new Date().toISOString() });
});

app.get('/api/pr/kpis', (_req, res) => {
  res.json({ '90days': { description: 'PR and events KPIs', metrics: [] }, '12months': { description: 'PR and events KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// POSITIONING & MESSAGING DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/positioning/differentiation-matrix', (_req, res) => {
  res.json([]);
});

app.post('/api/positioning/differentiation-matrix', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, updatedAt: new Date().toISOString() });
});

app.get('/api/positioning/themes', (_req, res) => {
  res.json([]);
});

app.post('/api/positioning/themes', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, active: true, updatedAt: new Date().toISOString() });
});

app.get('/api/positioning/messaging-guide', (_req, res) => {
  res.json([]);
});

app.post('/api/positioning/messaging-guide', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'draft', updatedAt: new Date().toISOString() });
});

app.get('/api/positioning/guardrails', (_req, res) => {
  res.json([]);
});

app.post('/api/positioning/guardrails', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, updatedAt: new Date().toISOString() });
});

app.get('/api/positioning/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Positioning and messaging KPIs', metrics: [] }, '12months': { description: 'Positioning and messaging KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// PARTNERSHIPS DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/partnerships/pipeline', (_req, res) => {
  const data = loadDomainData<any>('partnerships');
  res.json(data?.pipeline || { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 20 });
});

app.post('/api/partnerships/pipeline', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, createdAt: new Date().toISOString() });
});

app.patch('/api/partnerships/pipeline/:id', (req, res) => {
  res.json({ id: req.params.id, partnerName: 'Sample Partner', partnerType: 'kyc', stage: req.body.stage || 'identified', owner: 'Partnerships Lead', createdAt: new Date().toISOString() });
});

app.get('/api/partnerships/diligence', (_req, res) => {
  res.json([]);
});

app.post('/api/partnerships/diligence', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'pending' });
});

app.get('/api/partnerships/use-case-mapping', (_req, res) => {
  res.json([]);
});

app.post('/api/partnerships/use-case-mapping', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, createdAt: new Date().toISOString() });
});

app.get('/api/partnerships/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Partnership KPIs', metrics: [] }, '12months': { description: 'Partnership KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// PAID MEDIA DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/paid-media/creative-library', (_req, res) => {
  res.json([]);
});

app.post('/api/paid-media/creative-library', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, reviewStatus: 'pending', createdAt: new Date().toISOString() });
});

app.get('/api/paid-media/avoid-list', (_req, res) => {
  res.json([]);
});

app.post('/api/paid-media/avoid-list', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, createdAt: new Date().toISOString() });
});

app.delete('/api/paid-media/avoid-list/:id', (_req, res) => {
  res.status(204).send();
});

app.get('/api/paid-media/review-queue', (_req, res) => {
  res.json([]);
});

app.post('/api/paid-media/review-queue', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, result: 'pass', createdAt: new Date().toISOString() });
});

app.get('/api/paid-media/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Paid media KPIs', metrics: [] }, '12months': { description: 'Paid media KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// OPERATIONS DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/operations/vendor-registry', (_req, res) => {
  res.json([]);
});

app.post('/api/operations/vendor-registry', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, status: 'active', createdAt: new Date().toISOString() });
});

app.get('/api/operations/onboarding-workflow', (_req, res) => {
  res.json([]);
});

app.post('/api/operations/onboarding-workflow/checklists', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, allCompleted: false, createdAt: new Date().toISOString() });
});

app.get('/api/operations/escalation-rules', (_req, res) => {
  res.json([]);
});

app.post('/api/operations/escalation-rules', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, createdAt: new Date().toISOString() });
});

app.get('/api/operations/budget-model', (_req, res) => {
  res.json({ totalBudget: 500000, channelAllocation: { 'Paid Media': 200000, 'Events': 100000, 'Content': 80000, 'PR': 60000, 'Tools': 60000 }, assumptions: ['Annual budget allocation for GTM activities'], personnelCosts: 350000, toolingCosts: 60000, spendToDate: 245000, updatedAt: new Date().toISOString() });
});

app.patch('/api/operations/budget-model', (_req, res) => {
  res.json({ totalBudget: _req.body.totalBudget || 500000, channelAllocation: _req.body.channelAllocation || {}, assumptions: _req.body.assumptions || [], personnelCosts: _req.body.personnelCosts || 350000, toolingCosts: _req.body.toolingCosts || 60000, spendToDate: _req.body.spendToDate || 245000, updatedAt: new Date().toISOString() });
});

app.get('/api/operations/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Operations KPIs', metrics: [] }, '12months': { description: 'Operations KPIs - annual', metrics: [] } });
});

// ═══════════════════════════════════════════════════════════════════════
// WEBSITES & CONVERSION DOMAIN
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/conversion/kyc-handoff', (_req, res) => {
  const data = loadDomainData<any>('websites-conversion');
  res.json(data?.kycHandoffs || { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 20 });
});

app.post('/api/conversion/kyc-handoff', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID(), ..._req.body, handoffStatus: 'pending', handoffInitiatedAt: new Date().toISOString() });
});

app.get('/api/conversion/funnel-metrics', (_req, res) => {
  res.json({ description: 'Conversion funnel metrics', totalVisitors: 45200, totalSignups: 3200, kycStarted: 2100, kycCompleted: 1750, accountsActivated: 1200, conversionRates: { visitorToSignup: 0.071, signupToKycStart: 0.656, kycStartToKycComplete: 0.833, kycCompleteToActivated: 0.686 }, handoffFailureRate: 0.15, averageTimeToKycInitiationHours: 48.5, stageBreakdown: [] });
});

app.get('/api/conversion/funnel-metrics/:stage', (req, res) => {
  res.json({ id: req.params.stage, name: req.params.stage, count: 100, previousCount: 80, source: 'Web Analytics' });
});

app.post('/api/conversion/events', (_req, res) => {
  res.status(201).json({ id: crypto.randomUUID() });
});

app.get('/api/conversion/kpis', (_req, res) => {
  res.json({ '90days': { description: 'Website conversion KPIs', metrics: [] }, '12months': { description: 'Website conversion KPIs - annual', metrics: [] } });
});

// ─── Competitive Intelligence (shared) ────────────────────────────────
app.get('/api/competitive-intelligence/share-of-voice', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.shareOfVoice);
});

export default app;