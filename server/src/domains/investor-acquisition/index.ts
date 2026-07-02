import { Router, Request, Response } from 'express';
import { loadDomainData, uuid, getItems, findItem } from '../common/helpers';

const router = Router();
const DOMAIN = 'investor-acquisition';

// ─── Waitlist ─────────────────────────────────────────────────────────────
router.get('/waitlist', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'waitlist'));
});

router.post('/waitlist', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, signedUpAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Segments ─────────────────────────────────────────────────────────────
router.get('/segments', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'segments'));
});

router.post('/segments', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Positioning Tests ────────────────────────────────────────────────────
router.get('/positioning-tests', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'positioningTests'));
});

router.post('/positioning-tests', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Compliance Matrix ────────────────────────────────────────────────────
router.get('/compliance-matrix', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.complianceMatrix || []);
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

export default router;
