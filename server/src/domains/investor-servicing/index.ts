import { Router, Request, Response } from 'express';
import { loadDomainData, uuid, getItems, findItem } from '../common/helpers';

const router = Router();
const DOMAIN = 'investor-servicing';

// ─── Service Dashboard ────────────────────────────────────────────────────
router.get('/dashboard', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.dashboard || {});
});

// ─── Support Tickets ──────────────────────────────────────────────────────
router.get('/support-tickets', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'supportTickets'));
});

router.post('/support-tickets', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

router.get('/support-tickets/:id', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const item = findItem(data, 'supportTickets', _req.params.id);
  if (!item) return res.status(404).json({ error: 'Support ticket not found' });
  res.json(item);
});

router.patch('/support-tickets/:id', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const item = findItem(data, 'supportTickets', _req.params.id);
  if (!item) return res.status(404).json({ error: 'Support ticket not found' });
  res.json({ ...item, ..._req.body });
});

// ─── Education Completion ─────────────────────────────────────────────────
router.get('/education-completion', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.educationCompletion || []);
});

router.post('/education-completion', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, completedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Six-Month Gate ───────────────────────────────────────────────────────
router.get('/six-month-gate', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.sixMonthGate || {});
});

router.post('/six-month-gate/decisions', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, decidedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── KPIs ─────────────────────────────────────────────────────────────────
router.get('/kpis', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.kpis || {});
});

export default router;
