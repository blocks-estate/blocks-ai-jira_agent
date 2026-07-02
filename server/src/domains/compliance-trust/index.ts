import { Router, Request, Response } from 'express';
import { loadDomainData, uuid, getItems, findItem } from '../common/helpers';

const router = Router();
const DOMAIN = 'compliance-trust';

// ─── Avoid List ───────────────────────────────────────────────────────────
router.get('/avoid-list', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'avoidList'));
});

router.post('/avoid-list', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

router.delete('/avoid-list/:id', (_req: Request, res: Response) => {
  res.status(204).send();
});

// ─── Claim Matrix ─────────────────────────────────────────────────────────
router.get('/claim-matrix', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'claimMatrix'));
});

router.post('/claim-matrix', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

router.patch('/claim-matrix/:id', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const item = findItem(data, 'claimMatrix', _req.params.id);
  if (!item) return res.status(404).json({ error: 'Claim matrix entry not found' });
  res.json({ ...item, ..._req.body, updatedAt: new Date().toISOString() });
});

// ─── Checklists ───────────────────────────────────────────────────────────
router.get('/checklists', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'checklists'));
});

router.post('/checklists', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Risk Language ────────────────────────────────────────────────────────
router.get('/risk-language', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'riskLanguage'));
});

router.post('/risk-language/modules', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, version: 1, updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── KPIs ─────────────────────────────────────────────────────────────────
router.get('/kpis', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.kpis || {});
});

export default router;
