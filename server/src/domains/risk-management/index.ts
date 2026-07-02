import { Router, Request, Response } from 'express';
import { loadDomainData, uuid, getItems, findItem } from '../common/helpers';

const router = Router();
const DOMAIN = 'risk-management';

// ─── Risk Mitigation Register ─────────────────────────────────────────────
router.get('/mitigation-register', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'mitigationRegister'));
});

router.post('/mitigation-register', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

router.patch('/mitigation-register/:id', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const item = findItem(data, 'mitigationRegister', _req.params.id);
  if (!item) return res.status(404).json({ error: 'Mitigation entry not found' });
  res.json({ ...item, ..._req.body, updatedAt: new Date().toISOString() });
});

// ─── Market Outlook ───────────────────────────────────────────────────────
router.get('/market-outlook', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.marketOutlook || {});
});

router.post('/market-outlook/triggers', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Talking Points ───────────────────────────────────────────────────────
router.get('/talking-points', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.talkingPoints || []);
});

router.post('/talking-points', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, version: 1, updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Escalation Guides ────────────────────────────────────────────────────
router.get('/escalation-guides', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.escalationGuides || []);
});

router.post('/escalation-guides', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── FAQ ──────────────────────────────────────────────────────────────────
router.get('/faq', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.faq || []);
});

router.post('/faq', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── KPIs ─────────────────────────────────────────────────────────────────
router.get('/kpis', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.kpis || {});
});

export default router;
