import { Router, Request, Response } from 'express';
import { loadDomainData, uuid, getItems, findItem } from '../common/helpers';

const router = Router();
const DOMAIN = 'websites-conversion';

// ─── KYC Handoff ──────────────────────────────────────────────────────────
router.get('/kyc-handoff', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'kycHandoff'));
});

router.post('/kyc-handoff', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, handoffInitiatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Funnel Metrics ───────────────────────────────────────────────────────
router.get('/funnel-metrics', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.funnelMetrics || {});
});

router.get('/funnel-metrics/:stage', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const stage = getItems(data.funnelMetrics, 'stageBreakdown').find((s: any) => s.stage === _req.params.stage);
  if (!stage) return res.status(404).json({ error: 'Funnel stage not found' });
  res.json(stage);
});

// ─── Conversion Events ────────────────────────────────────────────────────
router.post('/events', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body };
  res.status(201).json({ id: newItem.id });
});

// ─── KPIs ─────────────────────────────────────────────────────────────────
router.get('/kpis', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.kpis || {});
});

export default router;
