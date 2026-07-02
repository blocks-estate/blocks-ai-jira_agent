import { Router, Request, Response } from 'express';
import { loadDomainData, uuid, getItems, findItem } from '../common/helpers';

const router = Router();
const DOMAIN = 'positioning-messaging';

// ─── Differentiation Matrix ───────────────────────────────────────────────
router.get('/differentiation-matrix', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'differentiationMatrix'));
});

router.post('/differentiation-matrix', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Positioning Themes ───────────────────────────────────────────────────
router.get('/themes', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'themes'));
});

router.post('/themes', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Messaging Guide ──────────────────────────────────────────────────────
router.get('/messaging-guide', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'messagingGuide'));
});

router.post('/messaging-guide', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Guardrails ───────────────────────────────────────────────────────────
router.get('/guardrails', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'guardrails'));
});

router.post('/guardrails', (_req: Request, res: Response) => {
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
