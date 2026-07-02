import { Router, Request, Response } from 'express';
import { loadDomainData, uuid } from '../common/helpers';

const router = Router();
const DOMAIN = 'analytics-reporting';

// ─── Dashboard Overview ───────────────────────────────────────────────────
router.get('/overview', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const overview = {
    meta: data.meta,
    dev90Status: data.developerKPIs?.['90days']?.metrics?.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit
    })) || [],
    dev12Status: data.developerKPIs?.['12months']?.metrics?.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit
    })) || [],
    inv90Status: data.investorKPIs?.['90days']?.metrics?.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit
    })) || [],
    inv12Status: data.investorKPIs?.['12months']?.metrics?.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit
    })) || [],
    prStatus: data.prKPIs?.metrics?.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit
    })) || [],
    seoStatus: data.seoContentKPIs?.metrics?.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit
    })) || [],
    tcStatus: data.trustComplianceKPIs?.metrics?.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit
    })) || [],
    weeklyReview: data.weeklyReview ? {
      status: data.weeklyReview.sections?.map((s: any) => ({ name: s.name, status: s.status })) || [],
      openActions: data.weeklyReview.actionItems?.filter((a: any) => a.status !== 'done').length || 0
    } : { status: [], openActions: 0 },
    funnelTotals: {
      investorConversionRate: data.investorFunnel?.stages?.length > 1
        ? data.investorFunnel.stages[data.investorFunnel.stages.length - 1].count / data.investorFunnel.stages[0].count
        : 0,
      developerConversionRate: data.developerFunnel?.stages?.length > 1
        ? data.developerFunnel.stages[data.developerFunnel.stages.length - 1].count / data.developerFunnel.stages[0].count
        : 0,
      investorStages: data.investorFunnel?.stages || [],
      developerStages: data.developerFunnel?.stages || []
    }
  };
  res.json(overview);
});

// ─── Raw KPIs (Full Payload) ──────────────────────────────────────────────
router.get('/kpis', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json({
    meta: data.meta,
    developerKPIs: data.developerKPIs,
    investorKPIs: data.investorKPIs,
    prKPIs: data.prKPIs,
    seoContentKPIs: data.seoContentKPIs,
    trustComplianceKPIs: data.trustComplianceKPIs
  });
});

router.get('/kpis/developer', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.developerKPIs || {});
});

router.get('/kpis/investor', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.investorKPIs || {});
});

router.get('/kpis/pr', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.prKPIs || {});
});

router.get('/kpis/seo-content', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.seoContentKPIs || {});
});

router.get('/kpis/trust-compliance', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.trustComplianceKPIs || {});
});

// ─── Conversion Funnels ───────────────────────────────────────────────────
router.get('/funnels', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json({
    investor: data.investorFunnel || {},
    developer: data.developerFunnel || {}
  });
});

router.get('/funnels/investor', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.investorFunnel || {});
});

router.get('/funnels/developer', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.developerFunnel || {});
});

// ─── Share of Voice ───────────────────────────────────────────────────────
router.get('/share-of-voice', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.shareOfVoice || {});
});

// ─── Document Tracking ────────────────────────────────────────────────────
router.get('/document-tracking', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.documentTracking || {});
});

// ─── Subscription Tracking ────────────────────────────────────────────────
router.get('/subscription-tracking', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.subscriptionTracking || {});
});

// ─── Weekly Review ────────────────────────────────────────────────────────
router.get('/weekly-review', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.weeklyReview || {});
});

// ─── KPI Dictionary ───────────────────────────────────────────────────────
router.get('/kpi-dictionary', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.kpiDictionary || {});
});

// ─── Funnel Instrumentation ───────────────────────────────────────────────
router.get('/funnel-instrumentation', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.funnelInstrumentation || {});
});

export default router;
