import { Router, Request, Response } from 'express';
import { loadDomainData, uuid } from '../common/helpers';

const router = Router();
const DOMAIN = 'sales-ops-crm';

// ─── LOI Tracking ─────────────────────────────────────────────────────────
router.get('/loi/tracking', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.loiTracking?.items || data.loiRecords || []);
});

router.post('/loi/tracking', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

router.get('/loi/tracking/:id', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const items = data.loiTracking?.items || data.loiRecords || [];
  const item = items.find((l: any) => l.id === _req.params.id);
  if (!item) return res.status(404).json({ error: 'LOI record not found' });
  res.json(item);
});

router.patch('/loi/tracking/:id', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const items = data.loiTracking?.items || data.loiRecords || [];
  const item = items.find((l: any) => l.id === _req.params.id);
  if (!item) return res.status(404).json({ error: 'LOI record not found' });
  res.json({ ...item, ..._req.body, updatedAt: new Date().toISOString() });
});

router.delete('/loi/tracking/:id', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const items = data.loiTracking?.items || data.loiRecords || [];
  const item = items.find((l: any) => l.id === _req.params.id);
  if (!item) return res.status(404).json({ error: 'LOI record not found' });
  res.status(204).send();
});

// ─── LOI Pipeline ─────────────────────────────────────────────────────────
router.get('/loi/pipeline', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.pipeline || {});
});

// ─── LOI Reporting ────────────────────────────────────────────────────────
router.get('/loi/reporting', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.reporting || {});
});

// ─── KPIs ─────────────────────────────────────────────────────────────────
router.get('/loi/kpis', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.kpis || {});
});

export default router;
