import { Router, Request, Response } from 'express';
import { loadDomainData, uuid, getItems, findItem } from '../common/helpers';

const router = Router();
const DOMAIN = 'paid-media';

// ─── Creative Library ─────────────────────────────────────────────────────
router.get('/creative-library', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'creativeLibrary'));
});

router.post('/creative-library', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Avoid List ───────────────────────────────────────────────────────────
router.get('/avoid-list', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'avoidList'));
});

router.post('/avoid-list', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

router.delete('/avoid-list/:id', (_req: Request, res: Response) => {
  res.status(204).send();
});

// ─── Review Queue ─────────────────────────────────────────────────────────
router.get('/review-queue', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'reviewQueue'));
});

router.post('/review-queue', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── KPIs ─────────────────────────────────────────────────────────────────
router.get('/kpis', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.kpis || {});
});

export default router;
