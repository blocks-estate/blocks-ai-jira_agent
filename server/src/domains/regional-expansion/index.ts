import { Router, Request, Response } from 'express';
import { loadDomainData, uuid, getItems, findItem } from '../common/helpers';

const router = Router();
const DOMAIN = 'regional-expansion';

// ─── Jurisdictions ────────────────────────────────────────────────────────
router.get('/jurisdictions', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'jurisdictions'));
});

router.post('/jurisdictions', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Jurisdiction Guardrails ──────────────────────────────────────────────
router.get('/jurisdictions/:id/guardrails', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const jurisdiction = findItem(data, 'jurisdictions', _req.params.id);
  if (!jurisdiction) return res.status(404).json({ error: 'Jurisdiction not found' });
  const guardrails = (data.guardrails || []).filter((g: any) => g.jurisdictionId === _req.params.id);
  res.json(guardrails);
});

router.post('/jurisdictions/:id/guardrails', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  const jurisdiction = findItem(data, 'jurisdictions', _req.params.id);
  if (!jurisdiction) return res.status(404).json({ error: 'Jurisdiction not found' });
  const newItem = { id: uuid(), jurisdictionId: _req.params.id, ..._req.body, updatedAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Entry Memos ──────────────────────────────────────────────────────────
router.get('/entry-memos', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.entryMemos || []);
});

router.post('/entry-memos', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Claim Reference ──────────────────────────────────────────────────────
router.get('/claim-reference', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.claimReference || []);
});

router.post('/claim-reference', (_req: Request, res: Response) => {
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
