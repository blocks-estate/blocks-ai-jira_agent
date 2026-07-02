import { Router, Request, Response } from 'express';
import { loadDomainData, uuid, getItems, findItem } from '../common/helpers';

const router = Router();
const DOMAIN = 'content-seo';

// ─── Content Performance ──────────────────────────────────────────────────
router.get('/performance', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.performance || {});
});

// ─── Content Assets ───────────────────────────────────────────────────────
router.get('/assets', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'assets'));
});

router.post('/assets', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

router.get('/assets/:id', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const item = findItem(data, 'assets', _req.params.id);
  if (!item) return res.status(404).json({ error: 'Asset not found' });
  res.json(item);
});

router.patch('/assets/:id', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const item = findItem(data, 'assets', _req.params.id);
  if (!item) return res.status(404).json({ error: 'Asset not found' });
  res.json({ ...item, ..._req.body });
});

// ─── Glossary ─────────────────────────────────────────────────────────────
router.get('/glossary', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.glossary || []);
});

router.post('/glossary/entries', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Localization ─────────────────────────────────────────────────────────
router.get('/localization-queue', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.localizationQueue || []);
});

router.post('/localization-queue', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── SEO ──────────────────────────────────────────────────────────────────
router.get('/seo/keywords', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.seoKeywords || []);
});

router.get('/seo/rankings', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.seoRankings || {});
});

// ─── KPIs ─────────────────────────────────────────────────────────────────
router.get('/kpis', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.kpis || {});
});

export default router;
