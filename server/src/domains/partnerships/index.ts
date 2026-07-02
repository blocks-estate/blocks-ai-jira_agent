import { Router, Request, Response } from 'express';
import { loadDomainData, uuid, getItems, findItem } from '../common/helpers';

const router = Router();
const DOMAIN = 'partnerships';

// ─── Partnership Pipeline ─────────────────────────────────────────────────
router.get('/pipeline', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'pipeline'));
});

router.post('/pipeline', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

router.patch('/pipeline/:id', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const item = findItem(data, 'pipeline', _req.params.id);
  if (!item) return res.status(404).json({ error: 'Pipeline entry not found' });
  res.json({ ...item, ..._req.body });
});

// ─── Due Diligence ────────────────────────────────────────────────────────
router.get('/diligence', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.diligence || []);
});

router.post('/diligence', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body };
  res.status(201).json(newItem);
});

// ─── Use Case Mapping ─────────────────────────────────────────────────────
router.get('/use-case-mapping', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.useCaseMapping || []);
});

router.post('/use-case-mapping', (_req: Request, res: Response) => {
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
