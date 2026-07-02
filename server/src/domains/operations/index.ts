import { Router, Request, Response } from 'express';
import { loadDomainData, uuid, getItems, findItem } from '../common/helpers';

const router = Router();
const DOMAIN = 'operations';

// ─── Vendor Registry ──────────────────────────────────────────────────────
router.get('/vendor-registry', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'vendorRegistry'));
});

router.post('/vendor-registry', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Onboarding Workflow ──────────────────────────────────────────────────
router.get('/onboarding-workflow', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'onboardingWorkflow'));
});

router.post('/onboarding-workflow/checklists', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Escalation Rules ─────────────────────────────────────────────────────
router.get('/escalation-rules', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(getItems(data, 'escalationRules'));
});

router.post('/escalation-rules', (_req: Request, res: Response) => {
  const newItem = { id: uuid(), ..._req.body, createdAt: new Date().toISOString() };
  res.status(201).json(newItem);
});

// ─── Budget Model ─────────────────────────────────────────────────────────
router.get('/budget-model', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.budgetModel || {});
});

router.patch('/budget-model', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json({ ...data.budgetModel, ..._req.body, updatedAt: new Date().toISOString() });
});

// ─── KPIs ─────────────────────────────────────────────────────────────────
router.get('/kpis', (_req: Request, res: Response) => {
  const data = loadDomainData<any>(DOMAIN);
  if (!data) return res.status(404).json({ error: 'Domain data not found' });
  res.json(data.kpis || {});
});

export default router;
