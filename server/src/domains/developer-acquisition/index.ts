import { Router, Request, Response } from 'express';
import { loadDomainData, uuid, getItems, findItem } from '../common/helpers';

const router = Router();
const DOMAIN = 'developer-acquisition';

// ─── Developer Opportunities ──────────────────────────────────────────────
router.get('/opportunities', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'opportunities'));
});

router.post('/opportunities', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

router.get('/opportunities/:id', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const item = findItem(data, 'opportunities', _req.params.id);
  if (!item) return res.status(404).json({ error: 'Opportunity not found' });
  res.json(item);
});

router.patch('/opportunities/:id', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const item = findItem(data, 'opportunities', _req.params.id);
  if (!item) return res.status(404).json({ error: 'Opportunity not found' });
  res.json({ ...item, ..._req.body, updatedAt: new Date().toISOString() });
});

// ─── Asset Scorecards ─────────────────────────────────────────────────────
router.get('/scorecards', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'scorecards'));
});

router.post('/scorecards', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

router.get('/scorecards/:id', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const item = findItem(data, 'scorecards', _req.params.id);
  if (!item) return res.status(404).json({ error: 'Scorecard not found' });
  res.json(item);
});

// ─── Candidate Assets ─────────────────────────────────────────────────────
router.get('/assets', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'assets'));
});

router.post('/assets', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Priority Areas ───────────────────────────────────────────────────────
router.get('/areas', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.areas || []);
});

// ─── KPI & Funnel ─────────────────────────────────────────────────────────
router.get('/kpis', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.kpis || {});
});

router.get('/funnel', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.funnel || {});
});

router.get('/pipeline-summary', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.pipelineSummary || {});
});

export default router;
