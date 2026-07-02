import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();

app.use(cors());
app.use(express.json());

function loadData<T>(filename: string): T | null {
  const candidates = [
    path.resolve(process.cwd(), 'data', filename),
    path.resolve(__dirname, '..', 'data', filename),
    path.resolve(__dirname, '..', '..', 'data', filename),
  ];
  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  }
  return null;
}

// ─── Core KPI Data ───
app.get('/api/kpis', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data);
});

// ─── Developer KPIs ───
app.get('/api/kpis/developer', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.developerKPIs);
});

// ─── Investor KPIs ───
app.get('/api/kpis/investor', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.investorKPIs);
});

// ─── PR KPIs ───
app.get('/api/kpis/pr', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.prKPIs);
});

// ─── SEO/Content KPIs ───
app.get('/api/kpis/seo-content', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.seoContentKPIs);
});

// ─── Trust/Compliance KPIs ───
app.get('/api/kpis/trust-compliance', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.trustComplianceKPIs);
});

// ─── Funnel Data ───
app.get('/api/funnels', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json({
    investor: data.investorFunnel,
    developer: data.developerFunnel,
  });
});

app.get('/api/funnels/investor', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.investorFunnel);
});

app.get('/api/funnels/developer', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.developerFunnel);
});

// ─── Share of Voice ───
app.get('/api/share-of-voice', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.shareOfVoice);
});

// ─── Document Tracking ───
app.get('/api/document-tracking', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.documentTracking);
});

// ─── Subscription Tracking ───
app.get('/api/subscription-tracking', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.subscriptionTracking);
});

// ─── KPI Dictionary ───
app.get('/api/kpi-dictionary', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.kpiDictionary);
});

// ─── Weekly Review ───
app.get('/api/weekly-review', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.weeklyReview);
});

// ─── Funnel Instrumentation Specs ───
app.get('/api/funnel-instrumentation', (_req, res) => {
  const data = loadData<any>('kpis.json');
  res.json(data.funnelInstrumentation);
});

// ─── Dashboard Overview ───
app.get('/api/overview', (_req, res) => {
  const data = loadData<any>('kpis.json');
  if (!data) return res.status(404).json({ error: 'No data found' });

  const overview = {
    meta: data.meta,
    dev90Status: data.developerKPIs['90days'].metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    dev12Status: data.developerKPIs['12months'].metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    inv90Status: data.investorKPIs['90days'].metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    inv12Status: data.investorKPIs['12months'].metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    prStatus: data.prKPIs.metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    seoStatus: data.seoContentKPIs.metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    tcStatus: data.trustComplianceKPIs.metrics.map((m: any) => ({
      name: m.name, status: m.status, current: m.current, target: m.target, unit: m.unit,
    })),
    weeklyReview: {
      status: data.weeklyReview.sections.map((s: any) => ({ name: s.name, status: s.status })),
      openActions: data.weeklyReview.actionItems.filter((a: any) => a.status !== 'done').length,
    },
    funnelTotals: {
      investorConversionRate:
        data.investorFunnel.stages[data.investorFunnel.stages.length - 1].count /
        data.investorFunnel.stages[0].count,
      developerConversionRate:
        data.developerFunnel.stages[data.developerFunnel.stages.length - 1].count /
        data.developerFunnel.stages[0].count,
      investorStages: data.investorFunnel.stages,
      developerStages: data.developerFunnel.stages,
    },
  };

  res.json(overview);
});

export default app;